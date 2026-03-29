import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import type { AuthClientId } from '@planning-monefica/shared-types';

const CLIENT_IDS: AuthClientId[] = ['ic-app', 'hr-admin', 'control-pane'];

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;

  @IsIn(CLIENT_IDS)
  clientId!: AuthClientId;
}
