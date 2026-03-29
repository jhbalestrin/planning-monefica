import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthErrorCodes, type AccessTokenPayload } from '@planning-monefica/shared-types';
import { Types } from 'mongoose';
import type { Request } from 'express';
import { RBAC_TENANT_PARAM } from '../rbac.constants';

@Injectable()
export class TenantIdParamGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const paramName =
      this.reflector.getAllAndOverride<string>(RBAC_TENANT_PARAM, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'tenantId';
    const req = context.switchToHttp().getRequest<
      Request & { user: AccessTokenPayload }
    >();
    const rawPath = req.params[paramName];
    const fromPath = Array.isArray(rawPath) ? rawPath[0] : rawPath;
    const fromJwt = req.user?.tenantId;
    if (!fromPath || !Types.ObjectId.isValid(fromPath)) {
      throw new ForbiddenException({
        message: 'Invalid tenant in request.',
        code: AuthErrorCodes.TENANT_MISMATCH,
      });
    }
    if (!fromJwt || !Types.ObjectId.isValid(fromJwt)) {
      throw new ForbiddenException({
        message: 'Tenant scope missing from session.',
        code: AuthErrorCodes.TENANT_MISMATCH,
      });
    }
    if (!new Types.ObjectId(fromJwt).equals(new Types.ObjectId(fromPath))) {
      throw new ForbiddenException({
        message: 'You cannot access another organization’s data.',
        code: AuthErrorCodes.TENANT_MISMATCH,
      });
    }
    return true;
  }
}
