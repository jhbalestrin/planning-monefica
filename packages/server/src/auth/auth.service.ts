import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { addMinutes, addSeconds } from 'date-fns';
import { Model, Types } from 'mongoose';
import {
  AuthClientId,
  AuthErrorCodes,
  AuthTokenPairResponseDto,
  type AccessTokenPayload,
  type AuthRole,
  type PrincipalType,
} from '@planning-monefica/shared-types';
import { AuthAuditService } from './auth-audit.service';
import {
  rolesAllowedForPlatformClient,
  rolesAllowedForTenantClient,
} from './auth-role.util';
import { assertPasswordPolicy } from './password-policy';
import { InviteToken } from './schemas/invite-token.schema';
import { LoginFailureBucket } from './schemas/login-failure-bucket.schema';
import { PasswordResetToken } from './schemas/password-reset-token.schema';
import { PlatformUser, PlatformUserDocument } from './schemas/platform-user.schema';
import { RefreshToken } from './schemas/refresh-token.schema';
import { TenantUser } from './schemas/tenant-user.schema';
import { generateOpaqueToken, hashOpaqueToken } from './token.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(TenantUser.name) private tenantUserModel: Model<TenantUser>,
    @InjectModel(PlatformUser.name)
    private platformUserModel: Model<PlatformUser>,
    @InjectModel(RefreshToken.name) private refreshModel: Model<RefreshToken>,
    @InjectModel(InviteToken.name) private inviteModel: Model<InviteToken>,
    @InjectModel(PasswordResetToken.name)
    private resetModel: Model<PasswordResetToken>,
    @InjectModel(LoginFailureBucket.name)
    private failureBucketModel: Model<LoginFailureBucket>,
    private jwtService: JwtService,
    private config: ConfigService,
    private audit: AuthAuditService,
  ) {}

  private accessTtlSec(): number {
    return Number(this.config.get('JWT_ACCESS_TTL_SEC') ?? 900);
  }

  private refreshTtlSec(): number {
    return Number(this.config.get('JWT_REFRESH_TTL_SEC') ?? 60 * 60 * 24 * 30);
  }

  private bcryptRounds(): number {
    return Number(this.config.get('BCRYPT_ROUNDS') ?? 10);
  }

  private loginMaxAttempts(): number {
    return Number(this.config.get('AUTH_LOGIN_MAX_ATTEMPTS') ?? 8);
  }

  private loginWindowSec(): number {
    return Number(this.config.get('AUTH_LOGIN_WINDOW_SEC') ?? 900);
  }

  private lockoutSec(): number {
    return Number(this.config.get('AUTH_LOCKOUT_SEC') ?? 900);
  }

  private inviteTtlMin(): number {
    return Number(this.config.get('AUTH_INVITE_TOKEN_TTL_MIN') ?? 10080);
  }

  private resetTtlMin(): number {
    return Number(this.config.get('AUTH_RESET_TOKEN_TTL_MIN') ?? 60);
  }

  private failureKey(email: string, clientId: AuthClientId): string {
    return `${email.toLowerCase().trim()}:${clientId}`;
  }

  private invalidCredentials(): never {
    throw new UnauthorizedException({
      message: 'Invalid credentials.',
      code: AuthErrorCodes.INVALID_CREDENTIALS,
    });
  }

  private async assertNotLoginLocked(
    email: string,
    clientId: AuthClientId,
  ): Promise<void> {
    const key = this.failureKey(email, clientId);
    const now = new Date();
    const doc = await this.failureBucketModel.findOne({ key }).exec();
    if (doc?.lockedUntil && doc.lockedUntil > now) {
      throw new UnauthorizedException({
        message: 'Too many failed sign-in attempts. Try again later.',
        code: AuthErrorCodes.TOO_MANY_ATTEMPTS,
      });
    }
  }

  private async recordLoginFailure(
    email: string,
    clientId: AuthClientId,
  ): Promise<void> {
    const key = this.failureKey(email, clientId);
    const now = new Date();
    const windowMs = this.loginWindowSec() * 1000;
    const max = this.loginMaxAttempts();
    let doc = await this.failureBucketModel.findOne({ key }).exec();
    if (
      !doc ||
      now.getTime() - doc.windowStarted.getTime() > windowMs
    ) {
      doc = await this.failureBucketModel.findOneAndUpdate(
        { key },
        {
          $set: {
            key,
            count: 1,
            windowStarted: now,
            lockedUntil: null,
          },
        },
        { upsert: true, new: true },
      );
    } else {
      doc.count += 1;
      if (doc.count >= max) {
        doc.lockedUntil = addSeconds(now, this.lockoutSec());
      }
      await doc.save();
    }
  }

  private async clearLoginFailures(
    email: string,
    clientId: AuthClientId,
  ): Promise<void> {
    await this.failureBucketModel
      .deleteOne({ key: this.failureKey(email, clientId) })
      .exec();
  }

  async login(
    emailRaw: string,
    password: string,
    clientId: AuthClientId,
    correlationId?: string,
  ): Promise<AuthTokenPairResponseDto> {
    const email = emailRaw.toLowerCase().trim();
    await this.assertNotLoginLocked(email, clientId);

    const isPlatformClient = clientId === 'control-pane';

    try {
      if (isPlatformClient) {
        const user = await this.platformUserModel
          .findOne({ email })
          .exec();
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
          await this.recordLoginFailure(email, clientId);
          this.audit.log('auth.login.failure', correlationId, {
            reason: 'bad_credentials',
            clientId,
            principalHint: 'platform',
          });
          this.invalidCredentials();
        }
        if (!user.active) {
          await this.recordLoginFailure(email, clientId);
          this.audit.log('auth.login.failure', correlationId, {
            reason: 'inactive',
            clientId,
          });
          this.invalidCredentials();
        }
        if (!rolesAllowedForPlatformClient(clientId, user.roles)) {
          await this.recordLoginFailure(email, clientId);
          this.invalidCredentials();
        }
        await this.clearLoginFailures(email, clientId);
        this.audit.log('auth.login.success', correlationId, {
          clientId,
          principalType: 'platform_user',
          sub: user._id.toString(),
        });
        return this.issueTokenPair(
          'platform_user',
          user._id as Types.ObjectId,
          user.roles,
          clientId,
          undefined,
          user,
        );
      }

      const user = await this.tenantUserModel.findOne({ email }).exec();
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        await this.recordLoginFailure(email, clientId);
        this.audit.log('auth.login.failure', correlationId, {
          reason: 'bad_credentials',
          clientId,
          principalHint: 'tenant',
        });
        this.invalidCredentials();
      }
      if (!user.active) {
        await this.recordLoginFailure(email, clientId);
        this.audit.log('auth.login.failure', correlationId, {
          reason: 'inactive',
          clientId,
        });
        this.invalidCredentials();
      }
      if (!rolesAllowedForTenantClient(clientId, user.roles)) {
        await this.recordLoginFailure(email, clientId);
        this.audit.log('auth.login.failure', correlationId, {
          reason: 'wrong_client',
          clientId,
        });
        throw new UnauthorizedException({
          message:
            'This account is not authorized for this application.',
          code: AuthErrorCodes.NOT_AUTHORIZED_FOR_CLIENT,
        });
      }
      if (user.passwordSetRequired) {
        await this.recordLoginFailure(email, clientId);
        throw new UnauthorizedException({
          message:
            'You must complete password setup from your invite before signing in.',
          code: AuthErrorCodes.SIGN_IN_FAILED,
        });
      }
      await this.clearLoginFailures(email, clientId);
      this.audit.log('auth.login.success', correlationId, {
        clientId,
        principalType: 'tenant_user',
        sub: user._id.toString(),
      });
      return this.issueTokenPair(
        'tenant_user',
        user._id as Types.ObjectId,
        user.roles,
        clientId,
        user.tenantId,
        undefined,
      );
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      this.logger.warn(`login error: ${(e as Error).message}`);
      this.invalidCredentials();
    }
  }

  private async issueTokenPair(
    principalType: PrincipalType,
    userId: Types.ObjectId,
    roles: AuthRole[],
    clientId: AuthClientId,
    tenantId?: Types.ObjectId,
    platformUser?: PlatformUserDocument,
  ): Promise<AuthTokenPairResponseDto> {
    const aud = clientId;
    const payload: AccessTokenPayload = {
      sub: userId.toString(),
      roles,
      aud,
      principalType,
    };
    if (principalType === 'tenant_user' && tenantId) {
      payload.tenantId = tenantId.toString();
    }
    if (principalType === 'platform_user' && platformUser) {
      payload.serveAllTenants = platformUser.serveAllTenants;
      if (!platformUser.serveAllTenants && platformUser.tenantIds?.length) {
        payload.tenantScope = platformUser.tenantIds.map((id) =>
          id.toString(),
        );
      }
    }

    const accessExpiresInSec = this.accessTtlSec();
    const accessToken = await this.jwtService.signAsync(
      { ...payload },
      { expiresIn: accessExpiresInSec },
    );

    const rawRefresh = generateOpaqueToken();
    const refreshExpiresInSec = this.refreshTtlSec();
    await this.refreshModel.create({
      tokenHash: hashOpaqueToken(rawRefresh),
      principalType,
      userId,
      clientId,
      expiresAt: addSeconds(new Date(), refreshExpiresInSec),
      revokedAt: null,
    });

    return {
      accessToken,
      accessExpiresInSec,
      refreshToken: rawRefresh,
      refreshExpiresInSec,
      tokenType: 'Bearer',
    };
  }

  async refresh(
    refreshTokenRaw: string,
    correlationId?: string,
  ): Promise<AuthTokenPairResponseDto> {
    const tokenHash = hashOpaqueToken(refreshTokenRaw);
    const doc = await this.refreshModel.findOne({ tokenHash }).exec();
    const now = new Date();
    if (!doc || doc.revokedAt || doc.expiresAt <= now) {
      throw new UnauthorizedException({
        message: 'Invalid or expired refresh token.',
        code: AuthErrorCodes.TOKEN_INVALID,
      });
    }

    if (doc.principalType === 'tenant_user') {
      const user = await this.tenantUserModel.findById(doc.userId).exec();
      if (!user?.active) {
        throw new UnauthorizedException({
          message: 'Invalid or expired refresh token.',
          code: AuthErrorCodes.TOKEN_INVALID,
        });
      }
      doc.revokedAt = now;
      await doc.save();
      this.audit.log('auth.refresh', correlationId, {
        principalType: 'tenant_user',
        sub: user._id.toString(),
      });
      return this.issueTokenPair(
        'tenant_user',
        user._id as Types.ObjectId,
        user.roles,
        doc.clientId,
        user.tenantId,
        undefined,
      );
    }

    const user = await this.platformUserModel.findById(doc.userId).exec();
    if (!user?.active) {
      throw new UnauthorizedException({
        message: 'Invalid or expired refresh token.',
        code: AuthErrorCodes.TOKEN_INVALID,
      });
    }
    doc.revokedAt = now;
    await doc.save();
    this.audit.log('auth.refresh', correlationId, {
      principalType: 'platform_user',
      sub: user._id.toString(),
    });
    return this.issueTokenPair(
      'platform_user',
      user._id as Types.ObjectId,
      user.roles,
      doc.clientId,
      undefined,
      user,
    );
  }

  async logout(refreshTokenRaw: string, correlationId?: string): Promise<void> {
    const tokenHash = hashOpaqueToken(refreshTokenRaw);
    const res = await this.refreshModel
      .updateOne(
        { tokenHash, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      )
      .exec();
    this.audit.log('auth.logout', correlationId, {
      matched: res.matchedCount,
    });
  }

  async revokeAllRefreshForUser(
    principalType: PrincipalType,
    userId: Types.ObjectId,
  ): Promise<void> {
    await this.refreshModel
      .updateMany(
        {
          principalType,
          userId,
          revokedAt: null,
        },
        { $set: { revokedAt: new Date() } },
      )
      .exec();
  }

  async changePassword(
    principalType: PrincipalType,
    userId: string,
    currentPassword: string,
    newPassword: string,
    correlationId?: string,
  ): Promise<void> {
    assertPasswordPolicy(newPassword);
    if (principalType === 'tenant_user') {
      const user = await this.tenantUserModel.findById(userId).exec();
      if (!user) {
        throw new UnauthorizedException({
          message: 'Unauthorized.',
          code: AuthErrorCodes.UNAUTHORIZED,
        });
      }
      if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
        throw new UnauthorizedException({
          message: 'Current password is incorrect.',
          code: AuthErrorCodes.INVALID_CREDENTIALS,
        });
      }
      user.passwordHash = await bcrypt.hash(newPassword, this.bcryptRounds());
      await user.save();
    } else {
      const user = await this.platformUserModel.findById(userId).exec();
      if (!user) {
        throw new UnauthorizedException({
          message: 'Unauthorized.',
          code: AuthErrorCodes.UNAUTHORIZED,
        });
      }
      if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
        throw new UnauthorizedException({
          message: 'Current password is incorrect.',
          code: AuthErrorCodes.INVALID_CREDENTIALS,
        });
      }
      user.passwordHash = await bcrypt.hash(newPassword, this.bcryptRounds());
      await user.save();
    }
    await this.revokeAllRefreshForUser(principalType, new Types.ObjectId(userId));
    this.audit.log('auth.password.change', correlationId, {
      principalType,
      sub: userId,
    });
  }

  async requestPasswordReset(
    emailRaw: string,
    clientId: AuthClientId,
    correlationId?: string,
  ): Promise<void> {
    const email = emailRaw.toLowerCase().trim();
    let principalType: PrincipalType | null = null;
    let userId: Types.ObjectId | null = null;

    if (clientId === 'control-pane') {
      const u = await this.platformUserModel.findOne({ email }).exec();
      if (u) {
        principalType = 'platform_user';
        userId = u._id as Types.ObjectId;
      }
    } else {
      const u = await this.tenantUserModel.findOne({ email }).exec();
      if (
        u &&
        rolesAllowedForTenantClient(clientId, u.roles) &&
        u.active
      ) {
        principalType = 'tenant_user';
        userId = u._id as Types.ObjectId;
      }
    }

    this.audit.log('auth.password.reset_requested', correlationId, {
      clientId,
      matched: Boolean(userId),
    });

    if (!principalType || !userId) {
      return;
    }

    const raw = generateOpaqueToken();
    await this.resetModel.create({
      tokenHash: hashOpaqueToken(raw),
      principalType,
      userId,
      clientId,
      expiresAt: addMinutes(new Date(), this.resetTtlMin()),
      consumedAt: null,
    });

    const devLog = this.config.get('AUTH_LOG_RESET_TOKEN_IN_DEV') === 'true';
    if (devLog) {
      this.logger.log(
        JSON.stringify({
          event: 'auth.password.reset_token_issued_dev',
          correlationId: correlationId ?? null,
          resetToken: raw,
        }),
      );
    }
  }

  async confirmPasswordReset(
    tokenRaw: string,
    newPassword: string,
    correlationId?: string,
  ): Promise<void> {
    assertPasswordPolicy(newPassword);
    const tokenHash = hashOpaqueToken(tokenRaw);
    const doc = await this.resetModel.findOne({ tokenHash }).exec();
    const now = new Date();
    if (!doc || doc.consumedAt || doc.expiresAt <= now) {
      throw new BadRequestException({
        message: 'Invalid or expired reset token.',
        code: AuthErrorCodes.RESET_INVALID,
      });
    }

    if (doc.principalType === 'tenant_user') {
      const user = await this.tenantUserModel.findById(doc.userId).exec();
      if (!user) {
        throw new BadRequestException({
          message: 'Invalid or expired reset token.',
          code: AuthErrorCodes.RESET_INVALID,
        });
      }
      user.passwordHash = await bcrypt.hash(newPassword, this.bcryptRounds());
      await user.save();
      await this.revokeAllRefreshForUser(
        'tenant_user',
        user._id as Types.ObjectId,
      );
    } else {
      const user = await this.platformUserModel.findById(doc.userId).exec();
      if (!user) {
        throw new BadRequestException({
          message: 'Invalid or expired reset token.',
          code: AuthErrorCodes.RESET_INVALID,
        });
      }
      user.passwordHash = await bcrypt.hash(newPassword, this.bcryptRounds());
      await user.save();
      await this.revokeAllRefreshForUser(
        'platform_user',
        user._id as Types.ObjectId,
      );
    }

    doc.consumedAt = now;
    await doc.save();
    this.audit.log('auth.password.reset_completed', correlationId, {
      principalType: doc.principalType,
      sub: doc.userId.toString(),
    });
  }

  async acceptInvite(
    tokenRaw: string,
    newPassword: string,
    correlationId?: string,
  ): Promise<void> {
    assertPasswordPolicy(newPassword);
    const tokenHash = hashOpaqueToken(tokenRaw);
    const doc = await this.inviteModel.findOne({ tokenHash }).exec();
    const now = new Date();
    if (!doc || doc.consumedAt || doc.expiresAt <= now) {
      throw new BadRequestException({
        message: 'Invalid or expired invite token.',
        code: AuthErrorCodes.INVITE_INVALID,
      });
    }

    const user = await this.tenantUserModel.findById(doc.tenantUserId).exec();
    if (!user) {
      throw new BadRequestException({
        message: 'Invalid or expired invite token.',
        code: AuthErrorCodes.INVITE_INVALID,
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, this.bcryptRounds());
    user.passwordSetRequired = false;
    await user.save();
    doc.consumedAt = now;
    await doc.save();
    this.audit.log('auth.password.change', correlationId, {
      context: 'invite_accept',
      sub: user._id.toString(),
    });
  }

  /** Dev / seed only — returns raw token when AUTH_ENABLE_DEV_INVITES=true */
  async issueInviteForTenantUser(tenantUserId: string): Promise<string> {
    if (this.config.get('AUTH_ENABLE_DEV_INVITES') !== 'true') {
      throw new BadRequestException('Dev invites disabled.');
    }
    const user = await this.tenantUserModel.findById(tenantUserId).exec();
    if (!user) {
      throw new BadRequestException('Tenant user not found.');
    }
    const raw = generateOpaqueToken();
    await this.inviteModel.create({
      tokenHash: hashOpaqueToken(raw),
      tenantUserId: user._id,
      expiresAt: addMinutes(new Date(), this.inviteTtlMin()),
      consumedAt: null,
    });
    return raw;
  }
}
