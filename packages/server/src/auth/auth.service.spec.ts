import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { addMinutes } from 'date-fns';
import { Types } from 'mongoose';
import { AuthErrorCodes } from '@planning-monefica/shared-types';
import { AuthAuditService } from './auth-audit.service';
import { AuthService } from './auth.service';
import { generateOpaqueToken, hashOpaqueToken } from './token.util';
import { InviteToken } from './schemas/invite-token.schema';
import { LoginFailureBucket } from './schemas/login-failure-bucket.schema';
import { PasswordResetToken } from './schemas/password-reset-token.schema';
import { PlatformUser } from './schemas/platform-user.schema';
import { RefreshToken } from './schemas/refresh-token.schema';
import { TenantUser } from './schemas/tenant-user.schema';

function execChain<T>(value: T | null): { exec: () => Promise<T | null> } {
  return { exec: () => Promise.resolve(value) };
}

describe('AuthService', () => {
  let service: AuthService;
  const tenantFindOne = jest.fn();
  const tenantFindById = jest.fn();
  const platformFindOne = jest.fn();
  const platformFindById = jest.fn();
  const refreshFindOne = jest.fn();
  const refreshCreate = jest.fn();
  const refreshUpdateOne = jest.fn();
  const refreshUpdateMany = jest.fn();
  const inviteCreate = jest.fn();
  const inviteFindOne = jest.fn();
  const resetCreate = jest.fn();
  const resetFindOne = jest.fn();
  const failureFindOne = jest.fn();
  const failureDeleteOne = jest.fn();
  const failureFindOneAndUpdate = jest.fn();
  const jwtSignAsync = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    tenantFindOne.mockReturnValue(execChain(null));
    tenantFindById.mockReturnValue(execChain(null));
    platformFindOne.mockReturnValue(execChain(null));
    platformFindById.mockReturnValue(execChain(null));
    refreshFindOne.mockReturnValue(execChain(null));
    refreshCreate.mockResolvedValue({});
    refreshUpdateOne.mockReturnValue({ exec: () => Promise.resolve({ matchedCount: 1 }) });
    refreshUpdateMany.mockReturnValue({ exec: () => Promise.resolve({}) });
    inviteCreate.mockResolvedValue({});
    inviteFindOne.mockReturnValue(execChain(null));
    resetCreate.mockResolvedValue({});
    resetFindOne.mockReturnValue(execChain(null));
    failureFindOne.mockReturnValue(execChain(null));
    failureDeleteOne.mockReturnValue({ exec: () => Promise.resolve({}) });
    failureFindOneAndUpdate.mockResolvedValue({
      key: 'x',
      count: 1,
      windowStarted: new Date(),
      lockedUntil: null,
      save: jest.fn().mockResolvedValue(undefined),
    });
    jwtSignAsync.mockResolvedValue('signed-access-token');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        AuthAuditService,
        {
          provide: getModelToken(TenantUser.name),
          useValue: {
            findOne: tenantFindOne,
            findById: tenantFindById,
          },
        },
        {
          provide: getModelToken(PlatformUser.name),
          useValue: {
            findOne: platformFindOne,
            findById: platformFindById,
          },
        },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: {
            findOne: refreshFindOne,
            create: refreshCreate,
            updateOne: refreshUpdateOne,
            updateMany: refreshUpdateMany,
          },
        },
        {
          provide: getModelToken(InviteToken.name),
          useValue: { create: inviteCreate, findOne: inviteFindOne },
        },
        {
          provide: getModelToken(PasswordResetToken.name),
          useValue: {
            create: resetCreate,
            findOne: resetFindOne,
          },
        },
        {
          provide: getModelToken(LoginFailureBucket.name),
          useValue: {
            findOne: failureFindOne,
            deleteOne: failureDeleteOne,
            findOneAndUpdate: failureFindOneAndUpdate,
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jwtSignAsync },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (k: string, d?: unknown) => {
              const m: Record<string, string> = {
                JWT_ACCESS_TTL_SEC: '900',
                JWT_REFRESH_TTL_SEC: '86400',
                BCRYPT_ROUNDS: '4',
                AUTH_LOGIN_MAX_ATTEMPTS: '8',
                AUTH_LOGIN_WINDOW_SEC: '900',
                AUTH_LOCKOUT_SEC: '900',
                AUTH_INVITE_TOKEN_TTL_MIN: '60',
                AUTH_RESET_TOKEN_TTL_MIN: '60',
                AUTH_LOG_RESET_TOKEN_IN_DEV: 'false',
                AUTH_ENABLE_DEV_INVITES: 'false',
              };
              return m[k] ?? d;
            },
            getOrThrow: (k: string) => {
              if (k === 'JWT_SECRET') return 'unit-test-secret';
              throw new Error(`missing ${k}`);
            },
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('login succeeds for ic-app collaborator with valid password', async () => {
    const hash = await bcrypt.hash('CorrectPass1', 4);
    const tid = new Types.ObjectId();
    const uid = new Types.ObjectId();
    tenantFindOne.mockReturnValue(
      execChain({
        _id: uid,
        email: 'u@tenant.com',
        passwordHash: hash,
        roles: ['collaborator'],
        tenantId: tid,
        active: true,
        passwordSetRequired: false,
      }),
    );

    const out = await service.login('u@tenant.com', 'CorrectPass1', 'ic-app');

    expect(out.accessToken).toBe('signed-access-token');
    expect(out.refreshToken).toHaveLength(64);
    expect(refreshCreate).toHaveBeenCalled();
    expect(failureDeleteOne).toHaveBeenCalled();
  });

  it('login rejects wrong password with INVALID_CREDENTIALS', async () => {
    const hash = await bcrypt.hash('CorrectPass1', 4);
    tenantFindOne.mockReturnValue(
      execChain({
        _id: new Types.ObjectId(),
        passwordHash: hash,
        roles: ['collaborator'],
        tenantId: new Types.ObjectId(),
        active: true,
        passwordSetRequired: false,
      }),
    );

    await expect(
      service.login('u@tenant.com', 'WrongPass1', 'ic-app'),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: AuthErrorCodes.INVALID_CREDENTIALS,
      }),
    });
  });

  it('login rejects collaborator on hr-admin with NOT_AUTHORIZED_FOR_CLIENT', async () => {
    const hash = await bcrypt.hash('CorrectPass1', 4);
    tenantFindOne.mockReturnValue(
      execChain({
        _id: new Types.ObjectId(),
        passwordHash: hash,
        roles: ['collaborator'],
        tenantId: new Types.ObjectId(),
        active: true,
        passwordSetRequired: false,
      }),
    );

    await expect(
      service.login('u@tenant.com', 'CorrectPass1', 'hr-admin'),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: AuthErrorCodes.NOT_AUTHORIZED_FOR_CLIENT,
      }),
    });
  });

  it('login rejects inactive tenant user like bad credentials', async () => {
    const hash = await bcrypt.hash('CorrectPass1', 4);
    tenantFindOne.mockReturnValue(
      execChain({
        _id: new Types.ObjectId(),
        passwordHash: hash,
        roles: ['collaborator'],
        tenantId: new Types.ObjectId(),
        active: false,
        passwordSetRequired: false,
      }),
    );

    await expect(
      service.login('u@tenant.com', 'CorrectPass1', 'ic-app'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refresh rejects unknown token', async () => {
    refreshFindOne.mockReturnValue(execChain(null));
    await expect(service.refresh('a'.repeat(64))).rejects.toMatchObject({
      response: expect.objectContaining({
        code: AuthErrorCodes.TOKEN_INVALID,
      }),
    });
  });

  it('refresh rotates and issues new pair for active tenant', async () => {
    const raw = 'a'.repeat(64);
    const uid = new Types.ObjectId();
    const tid = new Types.ObjectId();
    const docSave = jest.fn().mockResolvedValue(undefined);
    refreshFindOne.mockReturnValue(
      execChain({
        tokenHash: hashOpaqueToken(raw),
        principalType: 'tenant_user',
        userId: uid,
        clientId: 'ic-app',
        expiresAt: addMinutes(new Date(), 60),
        revokedAt: null,
        save: docSave,
      }),
    );
    tenantFindById.mockReturnValue(
      execChain({
        _id: uid,
        tenantId: tid,
        roles: ['collaborator'],
        active: true,
      }),
    );

    const out = await service.refresh(raw);

    expect(out.accessToken).toBe('signed-access-token');
    expect(docSave).toHaveBeenCalled();
    expect(refreshCreate).toHaveBeenCalled();
  });

  it('login rejects when lockout bucket is active', async () => {
    failureFindOne.mockReturnValue(
      execChain({
        key: 'u@tenant.com:ic-app',
        lockedUntil: addMinutes(new Date(), 15),
      }),
    );
    await expect(
      service.login('u@tenant.com', 'AnyPass1', 'ic-app'),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: AuthErrorCodes.TOO_MANY_ATTEMPTS,
      }),
    });
  });

  it('acceptInvite sets password and consumes token', async () => {
    const raw = generateOpaqueToken();
    const th = hashOpaqueToken(raw);
    const uid = new Types.ObjectId();
    const inviteSave = jest.fn().mockResolvedValue(undefined);
    const userSave = jest.fn().mockResolvedValue(undefined);
    inviteFindOne.mockReturnValue(
      execChain({
        tokenHash: th,
        tenantUserId: uid,
        expiresAt: addMinutes(new Date(), 60),
        consumedAt: null,
        save: inviteSave,
      }),
    );
    tenantFindById.mockReturnValue(
      execChain({
        _id: uid,
        passwordSetRequired: true,
        save: userSave,
      }),
    );

    await service.acceptInvite(raw, 'newpassWORD1');

    expect(userSave).toHaveBeenCalled();
    expect(inviteSave).toHaveBeenCalled();
  });

  it('acceptInvite rejects expired invite', async () => {
    const raw = generateOpaqueToken();
    const th = hashOpaqueToken(raw);
    inviteFindOne.mockReturnValue(
      execChain({
        tokenHash: th,
        tenantUserId: new Types.ObjectId(),
        expiresAt: addMinutes(new Date(), -60),
        consumedAt: null,
      }),
    );
    await expect(service.acceptInvite(raw, 'newpassWORD1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('confirmPasswordReset rejects unknown token', async () => {
    const raw = generateOpaqueToken();
    resetFindOne.mockReturnValue(execChain(null));
    await expect(
      service.confirmPasswordReset(raw, 'newpassWORD1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('confirmPasswordReset rejects expired token', async () => {
    const raw = generateOpaqueToken();
    resetFindOne.mockReturnValue(
      execChain({
        tokenHash: hashOpaqueToken(raw),
        principalType: 'tenant_user',
        userId: new Types.ObjectId(),
        clientId: 'ic-app',
        consumedAt: null,
        expiresAt: addMinutes(new Date(), -10),
      }),
    );
    await expect(
      service.confirmPasswordReset(raw, 'newpassWORD1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('confirmPasswordReset rejects consumed token', async () => {
    const raw = generateOpaqueToken();
    resetFindOne.mockReturnValue(
      execChain({
        tokenHash: hashOpaqueToken(raw),
        principalType: 'tenant_user',
        userId: new Types.ObjectId(),
        clientId: 'ic-app',
        consumedAt: new Date(),
        expiresAt: addMinutes(new Date(), 60),
      }),
    );
    await expect(
      service.confirmPasswordReset(raw, 'newpassWORD1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('confirmPasswordReset updates password and consumes token', async () => {
    const raw = generateOpaqueToken();
    const th = hashOpaqueToken(raw);
    const uid = new Types.ObjectId();
    const userSave = jest.fn().mockResolvedValue(undefined);
    const resetSave = jest.fn().mockResolvedValue(undefined);
    resetFindOne.mockReturnValue(
      execChain({
        tokenHash: th,
        principalType: 'tenant_user',
        userId: uid,
        clientId: 'ic-app',
        consumedAt: null,
        expiresAt: addMinutes(new Date(), 60),
        save: resetSave,
      }),
    );
    tenantFindById.mockReturnValue(
      execChain({
        _id: uid,
        save: userSave,
      }),
    );

    await service.confirmPasswordReset(raw, 'newpassWORD1');

    expect(userSave).toHaveBeenCalled();
    expect(resetSave).toHaveBeenCalled();
    expect(refreshUpdateMany).toHaveBeenCalled();
  });

  it('logout calls refresh updateOne', async () => {
    await service.logout('c'.repeat(64));
    expect(refreshUpdateOne).toHaveBeenCalled();
  });

  it('issueInviteForTenantUser rejects when dev invites disabled', async () => {
    await expect(
      service.issueInviteForTenantUser(new Types.ObjectId().toString()),
    ).rejects.toThrow(BadRequestException);
  });

  it('changePassword rejects wrong current password for tenant', async () => {
    const uid = new Types.ObjectId();
    const hash = await bcrypt.hash('OldPass123', 4);
    tenantFindById.mockReturnValue(
      execChain({
        _id: uid,
        passwordHash: hash,
        save: jest.fn(),
      }),
    );
    await expect(
      service.changePassword(
        'tenant_user',
        uid.toString(),
        'Wrong1',
        'Newpass123',
        undefined,
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: AuthErrorCodes.INVALID_CREDENTIALS,
      }),
    });
  });

  it('changePassword updates password and revokes refresh tokens', async () => {
    const uid = new Types.ObjectId();
    const hash = await bcrypt.hash('OldPass123', 4);
    const userSave = jest.fn().mockResolvedValue(undefined);
    tenantFindById.mockReturnValue(
      execChain({
        _id: uid,
        passwordHash: hash,
        save: userSave,
      }),
    );
    await service.changePassword(
      'tenant_user',
      uid.toString(),
      'OldPass123',
      'Newpass123',
      undefined,
    );
    expect(userSave).toHaveBeenCalled();
    expect(refreshUpdateMany).toHaveBeenCalled();
  });
});
