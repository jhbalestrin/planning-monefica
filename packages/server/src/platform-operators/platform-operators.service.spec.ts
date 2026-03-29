import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { PlatformUser } from '../auth/schemas/platform-user.schema';
import { PlatformOperatorsService } from './platform-operators.service';

describe('PlatformOperatorsService', () => {
  let service: PlatformOperatorsService;
  const findOne = jest.fn();
  const create = jest.fn();
  const findById = jest.fn();
  const revoke = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformOperatorsService,
        {
          provide: getModelToken(PlatformUser.name),
          useValue: { findOne, create, findById },
        },
        {
          provide: ConfigService,
          useValue: { get: (_k: string, d?: unknown) => d ?? '4' },
        },
        {
          provide: AuthService,
          useValue: { revokeAllRefreshForUser: revoke },
        },
      ],
    }).compile();
    service = module.get(PlatformOperatorsService);
  });

  it('create rejects duplicate email', async () => {
    findOne.mockReturnValue({ exec: () => Promise.resolve({ email: 'x' }) });
    await expect(
      service.create({
        email: 'dup@example.com',
        password: 'longenough1',
        roles: ['planning_consultant'],
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('setActive disables and revokes refresh', async () => {
    const uid = new Types.ObjectId();
    const save = jest.fn().mockResolvedValue(undefined);
    findById.mockReturnValue({
      exec: () =>
        Promise.resolve({
          _id: uid,
          active: true,
          save,
        }),
    });

    await service.setActive(uid.toString(), false);

    expect(save).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalledWith('platform_user', uid);
  });
});
