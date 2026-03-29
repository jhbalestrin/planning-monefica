import { IsString, MinLength } from 'class-validator';

export class ConfirmResetDto {
  @IsString()
  @MinLength(64)
  token!: string;

  @IsString()
  @MinLength(10)
  newPassword!: string;
}
