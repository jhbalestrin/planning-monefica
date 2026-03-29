import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthErrorCodes, type AccessTokenPayload } from '@planning-monefica/shared-types';
import type { Request } from 'express';
import { RBAC_REQUIRED_CLIENT } from '../rbac.constants';

@Injectable()
export class RequireClientGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.reflector.getAllAndOverride<
      AccessTokenPayload['aud']
    >(RBAC_REQUIRED_CLIENT, [context.getHandler(), context.getClass()]);
    if (!expected) {
      return true;
    }
    const req = context.switchToHttp().getRequest<
      Request & { user: AccessTokenPayload }
    >();
    const aud = req.user?.aud;
    if (aud !== expected) {
      throw new ForbiddenException({
        message: 'This route is not available for your application.',
        code: AuthErrorCodes.WRONG_CLIENT_FOR_ROUTE,
      });
    }
    return true;
  }
}
