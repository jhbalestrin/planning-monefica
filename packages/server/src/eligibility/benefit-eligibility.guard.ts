import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AccessTokenPayload } from '@planning-monefica/shared-types';
import { BenefitErrorCodes } from '@planning-monefica/shared-types';
import type { Request } from 'express';
import { Types } from 'mongoose';
import { EligibilityService } from './eligibility.service';

@Injectable()
export class BenefitEligibilityGuard implements CanActivate {
  constructor(private readonly eligibility: EligibilityService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<
      Request & { user: AccessTokenPayload }
    >();
    const u = req.user;
    if (u.principalType !== 'tenant_user' || !u.tenantId) {
      throw new ForbiddenException({
        message: 'Benefit access denied.',
        code: BenefitErrorCodes.NOT_ELIGIBLE,
      });
    }
    await this.eligibility.assertBenefitAccessAllowed(
      new Types.ObjectId(u.tenantId),
      new Types.ObjectId(u.sub),
    );
    return true;
  }
}
