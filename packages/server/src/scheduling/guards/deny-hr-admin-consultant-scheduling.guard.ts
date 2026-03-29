import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AccessTokenPayload } from '@planning-monefica/shared-types';
import { SchedulingErrorCodes } from '@planning-monefica/shared-types';
import type { Request } from 'express';

/**
 * SCHED-FR15 — hr_admin must not use consultant scheduling mutations even if
 * other roles are present on the token.
 */
@Injectable()
export class DenyHrAdminConsultantSchedulingGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<
      Request & { user: AccessTokenPayload }
    >();
    const roles = req.user?.roles ?? [];
    if (roles.includes('hr_admin')) {
      throw new ForbiddenException({
        message: 'HR admin cannot use consultant scheduling APIs.',
        code: SchedulingErrorCodes.HR_ADMIN_CONSULTANT_SCHEDULING_FORBIDDEN,
      });
    }
    return true;
  }
}
