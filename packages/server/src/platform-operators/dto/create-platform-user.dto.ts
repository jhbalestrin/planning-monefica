import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

const PLATFORM_ROLES = ['platform_admin', 'planning_consultant'] as const;

export class CreatePlatformUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(10)
  password!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(PLATFORM_ROLES, { each: true })
  roles!: (typeof PLATFORM_ROLES)[number][];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  serveAllTenants?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tenantIds?: string[];
}
