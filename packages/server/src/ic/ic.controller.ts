import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import type {
  AccessTokenPayload,
  EligibilitySelfStatusDto,
} from '@planning-monefica/shared-types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  RequireClient,
  RequireRoles,
  TenantIdFromParam,
} from '../auth/decorators/rbac.decorator';
import { RequireClientGuard } from '../auth/guards/require-client.guard';
import { RequireRolesGuard } from '../auth/guards/require-roles.guard';
import { RequireTenantPrincipalGuard } from '../auth/guards/require-tenant-principal.guard';
import { TenantIdParamGuard } from '../auth/guards/tenant-id-param.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BenefitEligibilityGuard } from '../eligibility/benefit-eligibility.guard';
import { EligibilityService } from '../eligibility/eligibility.service';

/**
 * IC-app–scoped routes (Epic 2.2, 4.x). Benefit routes add `BenefitEligibilityGuard` after auth/tenant.
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
  constructor(private readonly eligibility: EligibilityService) {}

  @Get(':tenantId/ping')
  ping(@Param('tenantId') tenantId: string): { scope: string; tenantId: string } {
    return { scope: 'ic', tenantId };
  }

  /** ELIG-FR6 — JWT `sub` + `tenantId` only; path tenant must match JWT. */
  @Get(':tenantId/me/eligibility')
  selfEligibility(
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<EligibilitySelfStatusDto> {
    return this.eligibility.getSelfEligibilityStatus(user);
  }

  /** Example benefit-scoped handler (ELIG-FR7/10/11). */
  @Get(':tenantId/benefit/ping')
  @UseGuards(BenefitEligibilityGuard)
  benefitPing(): { ok: true; scope: string } {
    return { ok: true, scope: 'benefit' };
  }
}
