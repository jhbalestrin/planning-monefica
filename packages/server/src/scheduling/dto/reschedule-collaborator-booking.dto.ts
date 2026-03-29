import { IsISO8601, IsMongoId } from 'class-validator';

export class RescheduleCollaboratorBookingDto {
  @IsMongoId()
  consultantId!: string;

  @IsISO8601()
  slotStartUtc!: string;

  @IsISO8601()
  slotEndUtc!: string;
}
