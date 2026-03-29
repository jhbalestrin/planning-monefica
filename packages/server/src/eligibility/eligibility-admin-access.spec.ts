import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import type { AccessTokenPayload } from '@planning-monefica/shared-types';
import { RequireClientGuard } from '../auth/guards/require-client.guard';
import { RequireRolesGuard } from '../auth/guards/require-roles.guard';
import { EligibilityController } from './eligibility.controller';

function execCtx(
  user: AccessTokenPayload,
  handler: unknown,
  targetClass: object,
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => targetClass,
    switchToHttp: () => ({
      getRequest: () => ({ user, params: { tenantId: user.tenantId ?? '' } }),
    }),
  } as ExecutionContext;
}

/** ELIG-FR9: ic-app collaborator cannot hit HR eligibility mutations. */
describe('EligibilityController admin access', () => {
  const reflector = new Reflector();
  const markHandler = Object.getOwnPropertyDescriptor(
    EligibilityController.prototype,
    'mark',
  )!.value;

  it('RequireClientGuard denies ic-app on hr-admin routes', () => {
    const g = new RequireClientGuard(reflector);
    const user: AccessTokenPayload = {
      sub: '507f1f77bcf86cd799439011',
      tenantId: '507f1f77bcf86cd799439012',
      aud: 'ic-app',
      principalType: 'tenant_user',
      roles: ['collaborator'],
    };
    expect(() =>
      g.canActivate(execCtx(user, markHandler, EligibilityController)),
    ).toThrow();
  });

  it('RequireRolesGuard denies collaborator without hr_admin', () => {
    const g = new RequireRolesGuard(reflector);
    const user: AccessTokenPayload = {
      sub: '507f1f77bcf86cd799439011',
      tenantId: '507f1f77bcf86cd799439012',
      aud: 'hr-admin',
      principalType: 'tenant_user',
      roles: ['collaborator'],
    };
    expect(() =>
      g.canActivate(execCtx(user, markHandler, EligibilityController)),
    ).toThrow();
  });
});
