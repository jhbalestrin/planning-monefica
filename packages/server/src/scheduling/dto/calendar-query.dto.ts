import { IsISO8601 } from 'class-validator';

export class CalendarQueryDto {
  @IsISO8601()
  fromUtc!: string;

  @IsISO8601()
  toUtc!: string;
}
