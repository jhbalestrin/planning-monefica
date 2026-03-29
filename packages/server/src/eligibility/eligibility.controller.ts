import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  AccessTokenPayload,
  EligibilityCollaboratorOptionDto,
  EligibilityListItemDto,
} from '@planning-monefica/shared-types';
import { Types } from 'mongoose';
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
import { MarkEligibilityDto } from './dto/mark-eligibility.dto';
import { EligibilityService } from './eligibility.service';

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
export class EligibilityController {
  constructor(private readonly eligibility: EligibilityService) {}

  /** Picker: collaborators; `excludeEligible=true` omits already-sponsored users. */
  @Get(':tenantId/eligibility/collaborators')
  collaborators(
    @Param('tenantId') tenantId: string,
    @Query('excludeEligible') excludeEligible?: string,
  ): Promise<EligibilityCollaboratorOptionDto[]> {
    return this.eligibility.listCollaboratorsForPicker(
      new Types.ObjectId(tenantId),
      excludeEligible === 'true' || excludeEligible === '1',
    );
  }

  @Get(':tenantId/eligibility')
  list(
    @Param('tenantId') tenantId: string,
  ): Promise<EligibilityListItemDto[]> {
    return this.eligibility.listForTenant(new Types.ObjectId(tenantId));
  }

  @Post(':tenantId/eligibility')
  mark(
    @Param('tenantId') tenantId: string,
    @Body() dto: MarkEligibilityDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<EligibilityListItemDto> {
    return this.eligibility.markEligible(
      new Types.ObjectId(tenantId),
      new Types.ObjectId(dto.userId),
      user.sub,
    );
  }

  @Delete(':tenantId/eligibility/:userId')
  remove(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<{ ok: true }> {
    return this.eligibility.removeEligible(
      new Types.ObjectId(tenantId),
      new Types.ObjectId(userId),
      user.sub,
    );
  }
}
