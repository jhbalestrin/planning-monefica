import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthAuditService } from './auth-audit.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TenantUserLookupService } from './tenant-user-lookup.service';
import { RequireClientGuard } from './guards/require-client.guard';
import { RequirePlatformPrincipalGuard } from './guards/require-platform-principal.guard';
import { RequireRolesGuard } from './guards/require-roles.guard';
import { RequireTenantPrincipalGuard } from './guards/require-tenant-principal.guard';
import { TenantIdParamGuard } from './guards/tenant-id-param.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { InviteToken, InviteTokenSchema } from './schemas/invite-token.schema';
import {
  LoginFailureBucket,
  LoginFailureBucketSchema,
} from './schemas/login-failure-bucket.schema';
import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from './schemas/password-reset-token.schema';
import {
  PlatformUser,
  PlatformUserSchema,
} from './schemas/platform-user.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { TenantUser, TenantUserSchema } from './schemas/tenant-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TenantUser.name, schema: TenantUserSchema },
      { name: PlatformUser.name, schema: PlatformUserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: InviteToken.name, schema: InviteTokenSchema },
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
      { name: LoginFailureBucket.name, schema: LoginFailureBucketSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(config.get('JWT_ACCESS_TTL_SEC') ?? 900),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthAuditService,
    TenantUserLookupService,
    JwtAuthGuard,
    RequireClientGuard,
    RequireRolesGuard,
    RequireTenantPrincipalGuard,
    RequirePlatformPrincipalGuard,
    TenantIdParamGuard,
  ],
  exports: [
    AuthService,
    TenantUserLookupService,
    JwtAuthGuard,
    JwtModule,
    MongooseModule,
    RequireClientGuard,
    RequireRolesGuard,
    RequireTenantPrincipalGuard,
    RequirePlatformPrincipalGuard,
    TenantIdParamGuard,
  ],
})
export class AuthModule {}
