import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
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
import { PatchTenantUserActiveDto } from './dto/patch-tenant-user-active.dto';
import { HrService } from './hr.service';

@Controller({ path: 'hr/tenants', version: '1' })
@UseGuards(
  JwtAuthGuard,
  RequireTenantPrincipalGuard,
  RequireClientGuard,
  RequireRolesGuard,
  TenantIdParamGuard,
)
@RequireClient('hr-admin')
@RequireRoles('hr_admin')
@TenantIdFromParam('tenantId')
export class HrController {
  constructor(private readonly hr: HrService) {}

  @Patch(':tenantId/users/:userId/active')
  setActive(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @Body() dto: PatchTenantUserActiveDto,
  ): Promise<{ ok: true }> {
    return this.hr.setTenantUserActive(tenantId, userId, dto.active);
  }
}
