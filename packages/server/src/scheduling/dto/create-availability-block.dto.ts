import { IsISO8601, IsMongoId } from 'class-validator';

export class CreateAvailabilityBlockDto {
  @IsMongoId()
  tenantId!: string;

  @IsISO8601()
  startUtc!: string;

  @IsISO8601()
  endUtc!: string;
}
