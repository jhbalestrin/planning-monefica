import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  RequireClient,
  RequireRoles,
  TenantIdFromParam,
} from '../auth/decorators/rbac.decorator';
import { RequireClientGuard } from '../auth/guards/require-client.guard';
import { RequireRolesGuard } from '../auth/guards/require-roles.guard';
import { RequireTenantPrincipalGuard } from '../auth/guards/require-tenant-principal.guard';
import { TenantIdParamGuard } from '../auth/guards/tenant-id-param.guard';

/**
 * IC-app–scoped stub (Epic 2.2). Real benefit/eligibility routes attach the same guard stack.
 */
@Controller({ path: 'ic/tenants', version: '1' })
@UseGuards(
  JwtAuthGuard,
  RequireTenantPrincipalGuard,
  RequireClientGuard,
  RequireRolesGuard,
  TenantIdParamGuard,
)
@RequireClient('ic-app')
@RequireRoles('collaborator')
@TenantIdFromParam('tenantId')
export class IcController {
  @Get(':tenantId/ping')
  ping(@Param('tenantId') tenantId: string): { scope: string; tenantId: string } {
    return { scope: 'ic', tenantId };
  }
}
