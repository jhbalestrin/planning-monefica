import { IsMongoId } from 'class-validator';

export class MarkEligibilityDto {
  @IsMongoId()
  userId!: string;
}
