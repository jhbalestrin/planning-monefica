import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClient, RequireRoles } from '../auth/decorators/rbac.decorator';
import { RequireClientGuard } from '../auth/guards/require-client.guard';
import { RequirePlatformPrincipalGuard } from '../auth/guards/require-platform-principal.guard';
import { RequireRolesGuard } from '../auth/guards/require-roles.guard';

/**
 * Consultant-only scheduling surface (Epic 2.7). Epic 5+ replaces stubs with real APIs.
 */
@Controller({ path: 'scheduling', version: '1' })
@UseGuards(
  JwtAuthGuard,
  RequirePlatformPrincipalGuard,
  RequireClientGuard,
  RequireRolesGuard,
)
@RequireClient('control-pane')
@RequireRoles('planning_consultant')
export class SchedulingConsultantController {
  @Get('consultant/ping')
  consultantPing(): { scope: string; role: string } {
    return { scope: 'scheduling', role: 'planning_consultant' };
  }
}
