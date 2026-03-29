import { BadRequestException } from '@nestjs/common';
import { AuthErrorCodes } from '@planning-monefica/shared-types';
import { assertPasswordPolicy } from './password-policy';

describe('assertPasswordPolicy', () => {
  it('accepts 10+ chars with letter and number', () => {
    expect(() => assertPasswordPolicy('abcdefgh1x')).not.toThrow();
  });

  it('rejects short password', () => {
    expect(() => assertPasswordPolicy('short1')).toThrow(BadRequestException);
    try {
      assertPasswordPolicy('short1');
    } catch (e) {
      expect((e as BadRequestException).getResponse()).toMatchObject({
        code: AuthErrorCodes.WEAK_PASSWORD,
      });
    }
  });

  it('rejects missing digit', () => {
    expect(() => assertPasswordPolicy('abcdefghij')).toThrow(
      BadRequestException,
    );
  });

  it('rejects missing letter', () => {
    expect(() => assertPasswordPolicy('1234567890')).toThrow(
      BadRequestException,
    );
  });
});
