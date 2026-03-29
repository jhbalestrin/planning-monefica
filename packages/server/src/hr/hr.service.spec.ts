import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { TenantUser } from '../auth/schemas/tenant-user.schema';
import { HrService } from './hr.service';

describe('HrService', () => {
  let service: HrService;
  const findOne = jest.fn();
  const revoke = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrService,
        {
          provide: getModelToken(TenantUser.name),
          useValue: { findOne },
        },
        {
          provide: AuthService,
          useValue: { revokeAllRefreshForUser: revoke },
        },
      ],
    }).compile();
    service = module.get(HrService);
  });

  it('sets active and revokes refresh when deactivating', async () => {
    const tid = new Types.ObjectId();
    const uid = new Types.ObjectId();
    const save = jest.fn().mockResolvedValue(undefined);
    findOne.mockReturnValue({
      exec: () =>
        Promise.resolve({
          _id: uid,
          tenantId: tid,
          active: true,
          save,
        }),
    });

    await service.setTenantUserActive(tid.toString(), uid.toString(), false);

    expect(save).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalledWith('tenant_user', uid);
  });

  it('throws when user not in tenant', async () => {
    const tid = new Types.ObjectId();
    const uid = new Types.ObjectId();
    findOne.mockReturnValue({ exec: () => Promise.resolve(null) });

    await expect(
      service.setTenantUserActive(tid.toString(), uid.toString(), true),
    ).rejects.toThrow(NotFoundException);
  });
});
