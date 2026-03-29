import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthErrorCodes, type AccessTokenPayload } from '@planning-monefica/shared-types';
import type { Request } from 'express';

@Injectable()
export class RequirePlatformPrincipalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<
      Request & { user: AccessTokenPayload }
    >();
    if (req.user?.principalType !== 'platform_user') {
      throw new ForbiddenException({
        message: 'This route requires a platform operator session.',
        code: AuthErrorCodes.WRONG_PRINCIPAL_TYPE,
      });
    }
    return true;
  }
}
