import { BadRequestException } from '@nestjs/common';
import { AuthErrorCodes } from '@planning-monefica/shared-types';

export function assertPasswordPolicy(password: string): void {
  if (password.length < 10) {
    throw new BadRequestException({
      message: 'Password must be at least 10 characters.',
      code: AuthErrorCodes.WEAK_PASSWORD,
    });
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new BadRequestException({
      message: 'Password must include at least one letter and one number.',
      code: AuthErrorCodes.WEAK_PASSWORD,
    });
  }
}
