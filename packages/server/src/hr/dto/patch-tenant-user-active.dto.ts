import { IsBoolean } from 'class-validator';

export class PatchTenantUserActiveDto {
  @IsBoolean()
  active!: boolean;
}
