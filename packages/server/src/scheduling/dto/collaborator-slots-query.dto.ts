import { IsISO8601 } from 'class-validator';

export class CollaboratorSlotsQueryDto {
  @IsISO8601()
  fromUtc!: string;

  @IsISO8601()
  toUtc!: string;
}
