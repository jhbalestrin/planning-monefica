import { IsISO8601, IsMongoId } from 'class-validator';

export class CreateCollaboratorBookingDto {
  @IsMongoId()
  consultantId!: string;

  @IsISO8601()
  slotStartUtc!: string;

  @IsISO8601()
  slotEndUtc!: string;
}
