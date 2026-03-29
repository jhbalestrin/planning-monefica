import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type {
  AccessTokenPayload,
  AuthMeResponseDto,
  AuthTokenPairResponseDto,
} from '@planning-monefica/shared-types';
import { AuthService } from './auth.service';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfirmResetDto } from './dto/confirm-reset.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

type RequestWithCorrelation = Request & { correlationId?: string };
type RequestWithUser = RequestWithCorrelation & { user: AccessTokenPayload };

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private cid(req: RequestWithCorrelation): string | undefined {
    return req.correlationId;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: RequestWithCorrelation,
  ): Promise<AuthTokenPairResponseDto> {
    return this.auth.login(
      dto.email,
      dto.password,
      dto.clientId,
      this.cid(req),
    );
  }

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: RequestWithCorrelation,
  ): Promise<AuthTokenPairResponseDto> {
    return this.auth.refresh(dto.refreshToken, this.cid(req));
  }

  @Post('logout')
  async logout(
    @Body() dto: LogoutDto,
    @Req() req: RequestWithCorrelation,
  ): Promise<{ ok: true }> {
    await this.auth.logout(dto.refreshToken, this.cid(req));
    return { ok: true };
  }

  @Post('password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: RequestWithUser,
  ): Promise<{ ok: true }> {
    const u = req.user;
    await this.auth.changePassword(
      u.principalType,
      u.sub,
      dto.currentPassword,
      dto.newPassword,
      this.cid(req),
    );
    return { ok: true };
  }

  @Post('password/request-reset')
  async requestReset(
    @Body() dto: RequestResetDto,
    @Req() req: RequestWithCorrelation,
  ): Promise<{ ok: true }> {
    await this.auth.requestPasswordReset(
      dto.email,
      dto.clientId,
      this.cid(req),
    );
    return { ok: true };
  }

  @Post('password/reset')
  async confirmReset(
    @Body() dto: ConfirmResetDto,
    @Req() req: RequestWithCorrelation,
  ): Promise<{ ok: true }> {
    await this.auth.confirmPasswordReset(
      dto.token,
      dto.newPassword,
      this.cid(req),
    );
    return { ok: true };
  }

  @Post('invite/accept')
  async acceptInvite(
    @Body() dto: AcceptInviteDto,
    @Req() req: RequestWithCorrelation,
  ): Promise<{ ok: true }> {
    await this.auth.acceptInvite(
      dto.token,
      dto.newPassword,
      this.cid(req),
    );
    return { ok: true };
  }

  @Post('dev/invite/:tenantUserId')
  async devInvite(
    @Param('tenantUserId') tenantUserId: string,
  ): Promise<{ token: string }> {
    const token = await this.auth.issueInviteForTenantUser(tenantUserId);
    return { token };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: RequestWithUser): AuthMeResponseDto {
    const u = req.user;
    return {
      sub: u.sub,
      roles: u.roles,
      tenantId: u.tenantId,
      aud: u.aud,
      principalType: u.principalType,
      serveAllTenants: u.serveAllTenants,
      tenantScope: u.tenantScope,
    };
  }
}
