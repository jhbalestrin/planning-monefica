import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import type { AccessTokenPayload } from '@planning-monefica/shared-types';
import { Types } from 'mongoose';
import {
  RequireClient,
  RequireRoles,
  TenantIdFromParam,
} from '../decorators/rbac.decorator';
import { RequireClientGuard } from './require-client.guard';
import { RequirePlatformPrincipalGuard } from './require-platform-principal.guard';
import { RequireRolesGuard } from './require-roles.guard';
import { RequireTenantPrincipalGuard } from './require-tenant-principal.guard';
import { TenantIdParamGuard } from './tenant-id-param.guard';

class IcStub {
  @RequireClient('ic-app')
  @RequireRoles('collaborator')
  @TenantIdFromParam('tenantId')
  ping(): void {}
}

function ctx(
  user: AccessTokenPayload,
  params: Record<string, string>,
  handler: unknown,
  targetClass: object,
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => targetClass,
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
  } as ExecutionContext;
}

describe('RBAC guards (Epic 2)', () => {
  const reflector = new Reflector();
  const tidA = new Types.ObjectId().toString();
  const tidB = new Types.ObjectId().toString();
  const icUser: AccessTokenPayload = {
    sub: new Types.ObjectId().toString(),
    roles: ['collaborator'],
    tenantId: tidA,
    aud: 'ic-app',
    principalType: 'tenant_user',
  };
  const handler = Object.getOwnPropertyDescriptor(IcStub.prototype, 'ping')!.value;
  const icClass = IcStub;

  it('RequireClientGuard allows matching aud', () => {
    const g = new RequireClientGuard(reflector);
    expect(
      g.canActivate(ctx(icUser, { tenantId: tidA }, handler, icClass)),
    ).toBe(true);
  });

  it('RequireClientGuard rejects wrong client', () => {
    const g = new RequireClientGuard(reflector);
    const wrongAud = { ...icUser, aud: 'hr-admin' as const };
    expect(() =>
      g.canActivate(ctx(wrongAud, { tenantId: tidA }, handler, icClass)),
    ).toThrow(ForbiddenException);
  });

  it('RequireRolesGuard rejects missing role', () => {
    const g = new RequireRolesGuard(reflector);
    const hrOnly = { ...icUser, roles: ['hr_admin' as const] };
    expect(() =>
      g.canActivate(ctx(hrOnly, { tenantId: tidA }, handler, icClass)),
    ).toThrow(ForbiddenException);
  });

  it('TenantIdParamGuard rejects path tenant !== JWT tenant', () => {
    const g = new TenantIdParamGuard(reflector);
    expect(() =>
      g.canActivate(ctx(icUser, { tenantId: tidB }, handler, icClass)),
    ).toThrow(ForbiddenException);
  });

  it('TenantIdParamGuard allows matching tenant', () => {
    const g = new TenantIdParamGuard(reflector);
    expect(
      g.canActivate(ctx(icUser, { tenantId: tidA }, handler, icClass)),
    ).toBe(true);
  });

  it('RequireTenantPrincipalGuard rejects platform user on tenant route', () => {
    const g = new RequireTenantPrincipalGuard();
    const platformUser: AccessTokenPayload = {
      sub: new Types.ObjectId().toString(),
      roles: ['platform_admin'],
      aud: 'control-pane',
      principalType: 'platform_user',
    };
    expect(() =>
      g.canActivate(ctx(platformUser, {}, handler, icClass)),
    ).toThrow(ForbiddenException);
  });

  it('RequirePlatformPrincipalGuard rejects tenant user', () => {
    const g = new RequirePlatformPrincipalGuard();
    expect(() =>
      g.canActivate(ctx(icUser, {}, handler, icClass)),
    ).toThrow(ForbiddenException);
  });
});
