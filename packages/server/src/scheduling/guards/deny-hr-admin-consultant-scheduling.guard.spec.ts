import { ForbiddenException } from '@nestjs/common';
import type { AccessTokenPayload } from '@planning-monefica/shared-types';
import { SchedulingErrorCodes } from '@planning-monefica/shared-types';
import type { Request } from 'express';
import { DenyHrAdminConsultantSchedulingGuard } from './deny-hr-admin-consultant-scheduling.guard';

describe('DenyHrAdminConsultantSchedulingGuard (SCHED-FR15)', () => {
  const guard = new DenyHrAdminConsultantSchedulingGuard();

  function ctxFor(user: AccessTokenPayload) {
    return {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            user,
          }) as Request & { user: AccessTokenPayload },
      }),
    };
  }

  it('allows planning_consultant without hr_admin', () => {
    expect(
      guard.canActivate(
        ctxFor({
          sub: 'x',
          roles: ['planning_consultant'],
          aud: 'control-pane',
          principalType: 'platform_user',
        }) as never,
      ),
    ).toBe(true);
  });

  it('forbids hr_admin even with planning_consultant', () => {
    let err: unknown;
    try {
      guard.canActivate(
        ctxFor({
          sub: 'x',
          roles: ['hr_admin', 'planning_consultant'],
          aud: 'control-pane',
          principalType: 'platform_user',
        }) as never,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ForbiddenException);
    expect((err as ForbiddenException).getResponse()).toMatchObject({
      code: SchedulingErrorCodes.HR_ADMIN_CONSULTANT_SCHEDULING_FORBIDDEN,
    });
  });
});
