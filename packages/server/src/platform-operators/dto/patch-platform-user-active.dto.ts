import { IsBoolean } from 'class-validator';

export class PatchPlatformUserActiveDto {
  @IsBoolean()
  active!: boolean;
}
