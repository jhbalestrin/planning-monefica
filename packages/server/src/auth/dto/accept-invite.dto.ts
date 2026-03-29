import { IsString, MinLength } from 'class-validator';

export class AcceptInviteDto {
  @IsString()
  @MinLength(64)
  token!: string;

  @IsString()
  @MinLength(10)
  newPassword!: string;
}
