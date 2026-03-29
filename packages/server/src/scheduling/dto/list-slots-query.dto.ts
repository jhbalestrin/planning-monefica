import { IsISO8601, IsMongoId } from 'class-validator';

export class ListSlotsQueryDto {
  @IsMongoId()
  tenantId!: string;

  @IsISO8601()
  fromUtc!: string;

  @IsISO8601()
  toUtc!: string;
}
