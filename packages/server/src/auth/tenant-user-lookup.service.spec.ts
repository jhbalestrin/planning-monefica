import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { TenantUser } from './schemas/tenant-user.schema';
import { TenantUserLookupService } from './tenant-user-lookup.service';

describe('TenantUserLookupService', () => {
  let service: TenantUserLookupService;
  const findOne = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantUserLookupService,
        {
          provide: getModelToken(TenantUser.name),
          useValue: { findOne },
        },
      ],
    }).compile();
    service = module.get(TenantUserLookupService);
  });

  it('assertCollaboratorInTenant throws when not found', async () => {
    findOne.mockReturnValue({ exec: () => Promise.resolve(null) });
    const tid = new Types.ObjectId();
    const uid = new Types.ObjectId();
    await expect(
      service.assertCollaboratorInTenant(tid, uid),
    ).rejects.toThrow(NotFoundException);
  });
});
