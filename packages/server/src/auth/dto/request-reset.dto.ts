import { IsEmail, IsIn, IsString } from 'class-validator';
import type { AuthClientId } from '@planning-monefica/shared-types';

const CLIENT_IDS: AuthClientId[] = ['ic-app', 'hr-admin', 'control-pane'];

export class RequestResetDto {
  @IsEmail()
  email!: string;

  @IsIn(CLIENT_IDS)
  clientId!: AuthClientId;
}
