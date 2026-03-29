import { IsISO8601, IsMongoId, IsOptional } from 'class-validator';

export class UpdateAvailabilityBlockDto {
  @IsOptional()
  @IsMongoId()
  tenantId?: string;

  @IsOptional()
  @IsISO8601()
  startUtc?: string;

  @IsOptional()
  @IsISO8601()
  endUtc?: string;
}
