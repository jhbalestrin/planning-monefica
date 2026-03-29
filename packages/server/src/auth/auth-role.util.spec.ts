import {
  rolesAllowedForPlatformClient,
  rolesAllowedForTenantClient,
} from './auth-role.util';

describe('auth-role.util', () => {
  it('allows collaborator on ic-app only', () => {
    expect(rolesAllowedForTenantClient('ic-app', ['collaborator'])).toBe(true);
    expect(rolesAllowedForTenantClient('hr-admin', ['collaborator'])).toBe(
      false,
    );
  });

  it('allows hr_admin on hr-admin only', () => {
    expect(rolesAllowedForTenantClient('hr-admin', ['hr_admin'])).toBe(true);
    expect(rolesAllowedForTenantClient('ic-app', ['hr_admin'])).toBe(false);
  });

  it('allows platform roles on control-pane', () => {
    expect(
      rolesAllowedForPlatformClient('control-pane', ['platform_admin']),
    ).toBe(true);
    expect(
      rolesAllowedForPlatformClient('control-pane', ['planning_consultant']),
    ).toBe(true);
    expect(rolesAllowedForPlatformClient('ic-app', ['platform_admin'])).toBe(
      false,
    );
  });
});
