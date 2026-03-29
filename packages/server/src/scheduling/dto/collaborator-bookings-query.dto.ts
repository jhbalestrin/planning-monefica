import { IsISO8601, IsOptional } from 'class-validator';

export class CollaboratorBookingsQueryDto {
  @IsOptional()
  @IsISO8601()
  fromUtc?: string;

  @IsOptional()
  @IsISO8601()
  toUtc?: string;
}
