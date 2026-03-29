import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import type { AuthRole } from '@planning-monefica/shared-types';
import { Types } from 'mongoose';
import { PlatformUser } from './schemas/platform-user.schema';
import { PlatformUserLookupService } from './platform-user-lookup.service';

describe('PlatformUserLookupService', () => {
  let service: PlatformUserLookupService;
  const findById = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformUserLookupService,
        {
          provide: getModelToken(PlatformUser.name),
          useValue: {
            findById: findById,
          },
        },
      ],
    }).compile();
    service = module.get(PlatformUserLookupService);
  });

  it('getConsultantSchedulingScope returns null when missing', async () => {
    findById.mockReturnValue({ lean: () => ({ exec: () => Promise.resolve(null) }) });
    const id = new Types.ObjectId();
    await expect(service.getConsultantSchedulingScope(id)).resolves.toBeNull();
  });

  it('assertTenantAllowedForConsultant respects serveAllTenants and tenantIds', async () => {
    const tid = new Types.ObjectId();
    const scope = {
      serveAllTenants: false,
      tenantIds: [tid],
      roles: ['planning_consultant'] as AuthRole[],
      active: true,
    };
    expect(service.assertTenantAllowedForConsultant(scope, tid)).toBe(true);
    expect(
      service.assertTenantAllowedForConsultant(scope, new Types.ObjectId()),
    ).toBe(false);
    expect(
      service.assertTenantAllowedForConsultant(
        { ...scope, serveAllTenants: true },
        new Types.ObjectId(),
      ),
    ).toBe(true);
    expect(
      service.assertTenantAllowedForConsultant({ ...scope, active: false }, tid),
    ).toBe(false);
  });
});
