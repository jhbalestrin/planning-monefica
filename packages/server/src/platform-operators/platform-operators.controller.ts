import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClient, RequireRoles } from '../auth/decorators/rbac.decorator';
import { RequireClientGuard } from '../auth/guards/require-client.guard';
import { RequirePlatformPrincipalGuard } from '../auth/guards/require-platform-principal.guard';
import { RequireRolesGuard } from '../auth/guards/require-roles.guard';
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import { PatchPlatformUserActiveDto } from './dto/patch-platform-user-active.dto';
import { PlatformOperatorsService } from './platform-operators.service';

@Controller({ path: 'platform/users', version: '1' })
@UseGuards(
  JwtAuthGuard,
  RequirePlatformPrincipalGuard,
  RequireClientGuard,
  RequireRolesGuard,
)
@RequireClient('control-pane')
@RequireRoles('platform_admin')
export class PlatformOperatorsController {
  constructor(private readonly platform: PlatformOperatorsService) {}

  @Post()
  create(@Body() dto: CreatePlatformUserDto): Promise<{ id: string }> {
    return this.platform.create(dto);
  }

  @Patch(':userId/active')
  setActive(
    @Param('userId') userId: string,
    @Body() dto: PatchPlatformUserActiveDto,
  ): Promise<{ ok: true }> {
    return this.platform.setActive(userId, dto.active);
  }
}
