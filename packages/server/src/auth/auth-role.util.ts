import type { AuthClientId, AuthRole } from '@planning-monefica/shared-types';

export function rolesAllowedForTenantClient(
  clientId: AuthClientId,
  roles: AuthRole[],
): boolean {
  if (clientId === 'ic-app') {
    return roles.includes('collaborator');
  }
  if (clientId === 'hr-admin') {
    return roles.includes('hr_admin');
  }
  return false;
}

export function rolesAllowedForPlatformClient(
  clientId: AuthClientId,
  roles: AuthRole[],
): boolean {
  if (clientId !== 'control-pane') {
    return false;
  }
  return (
    roles.includes('platform_admin') || roles.includes('planning_consultant')
  );
}
