import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Types } from 'mongoose';
import type { AccessTokenPayload } from '@planning-monefica/shared-types';
import { BenefitErrorCodes } from '@planning-monefica/shared-types';
import { BenefitEligibilityGuard } from './benefit-eligibility.guard';
import { EligibilityService } from './eligibility.service';

describe('BenefitEligibilityGuard', () => {
  it('delegates to EligibilityService for tenant user', async () => {
    const assert = jest.fn().mockResolvedValue(undefined);
    const guard = new BenefitEligibilityGuard({
      assertBenefitAccessAllowed: assert,
    } as unknown as EligibilityService);
    const tid = new Types.ObjectId().toString();
    const uid = new Types.ObjectId().toString();
    const user: AccessTokenPayload = {
      sub: uid,
      tenantId: tid,
      aud: 'ic-app',
      principalType: 'tenant_user',
      roles: ['collaborator'],
    };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as ExecutionContext;
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(assert).toHaveBeenCalledWith(
      new Types.ObjectId(tid),
      new Types.ObjectId(uid),
    );
  });

  it('rejects platform principal', async () => {
    const assert = jest.fn();
    const guard = new BenefitEligibilityGuard({
      assertBenefitAccessAllowed: assert,
    } as unknown as EligibilityService);
    const user: AccessTokenPayload = {
      sub: new Types.ObjectId().toString(),
      aud: 'control-pane',
      principalType: 'platform_user',
      roles: ['platform_admin'],
    };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as ExecutionContext;
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      response: expect.objectContaining({
        code: BenefitErrorCodes.NOT_ELIGIBLE,
      }),
    });
    expect(assert).not.toHaveBeenCalled();
  });
});
