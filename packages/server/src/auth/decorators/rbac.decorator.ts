import { SetMetadata } from '@nestjs/common';
import type { AuthClientId, AuthRole } from '@planning-monefica/shared-types';
import {
  RBAC_REQUIRED_CLIENT,
  RBAC_REQUIRED_ROLES,
  RBAC_TENANT_PARAM,
} from '../rbac.constants';

export const RequireClient = (clientId: AuthClientId) =>
  SetMetadata(RBAC_REQUIRED_CLIENT, clientId);

export const RequireRoles = (...roles: AuthRole[]) =>
  SetMetadata(RBAC_REQUIRED_ROLES, roles);

/** Route param name holding tenant ObjectId string; compared to JWT `tenantId`. */
export const TenantIdFromParam = (paramName = 'tenantId') =>
  SetMetadata(RBAC_TENANT_PARAM, paramName);
