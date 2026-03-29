import { IsISO8601, IsOptional } from 'class-validator';

export class DateRangeQueryDto {
  @IsOptional()
  @IsISO8601()
  fromUtc?: string;

  @IsOptional()
  @IsISO8601()
  toUtc?: string;
}
