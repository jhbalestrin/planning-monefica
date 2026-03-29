import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthErrorCodes, type AccessTokenPayload } from '@planning-monefica/shared-types';
import type { Request } from 'express';

@Injectable()
export class RequireTenantPrincipalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<
      Request & { user: AccessTokenPayload }
    >();
    const u = req.user;
    if (u.principalType !== 'tenant_user' || !u.tenantId?.trim()) {
      throw new ForbiddenException({
        message: 'Tenant-scoped routes require a tenant user session.',
        code: AuthErrorCodes.WRONG_PRINCIPAL_TYPE,
      });
    }
    return true;
  }
}
