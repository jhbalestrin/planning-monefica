import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AuthErrorCodes,
  type AccessTokenPayload,
  type AuthRole,
} from '@planning-monefica/shared-types';
import type { Request } from 'express';
import { RBAC_REQUIRED_ROLES } from '../rbac.constants';

@Injectable()
export class RequireRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AuthRole[]>(
      RBAC_REQUIRED_ROLES,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) {
      throw new ForbiddenException({
        message: 'Route is missing role configuration.',
        code: AuthErrorCodes.FORBIDDEN,
      });
    }
    const req = context.switchToHttp().getRequest<
      Request & { user: AccessTokenPayload }
    >();
    const roles = req.user?.roles ?? [];
    const ok = required.some((r) => roles.includes(r));
    if (!ok) {
      throw new ForbiddenException({
        message: 'Insufficient role for this operation.',
        code: AuthErrorCodes.FORBIDDEN,
      });
    }
    return true;
  }
}
