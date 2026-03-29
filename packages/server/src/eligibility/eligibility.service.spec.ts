import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BenefitErrorCodes } from '@planning-monefica/shared-types';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { TenantUserLookupService } from '../auth/tenant-user-lookup.service';
import { EligibilityService } from './eligibility.service';
import { EmployeeEligibility } from './schemas/employee-eligibility.schema';
import { EligibilityAuditEvent } from './schemas/eligibility-audit-event.schema';

describe('EligibilityService', () => {
  let service: EligibilityService;
  const findElig = jest.fn();
  const findOneElig = jest.fn();
  const createElig = jest.fn();
  const deleteOneElig = jest.fn();
  const createAudit = jest.fn();
  const assertCollab = jest.fn();
  const listSummaries = jest.fn();
  const getSummaries = jest.fn();
  const getBenefitSnapshot = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    findElig.mockReturnValue({ sort: () => ({ lean: () => ({ exec: () => Promise.resolve([]) }) }) });
    findOneElig.mockReturnValue({
      exec: () => Promise.resolve(null),
      lean: () => ({ exec: () => Promise.resolve(null) }),
    });
    createElig.mockResolvedValue({});
    deleteOneElig.mockReturnValue({ exec: () => Promise.resolve({ deletedCount: 1 }) });
    createAudit.mockResolvedValue({});
    assertCollab.mockResolvedValue(undefined);
    listSummaries.mockResolvedValue([]);
    getSummaries.mockResolvedValue(new Map());
    getBenefitSnapshot.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EligibilityService,
        {
          provide: getModelToken(EmployeeEligibility.name),
          useValue: {
            find: findElig,
            findOne: findOneElig,
            create: createElig,
            deleteOne: deleteOneElig,
          },
        },
        {
          provide: getModelToken(EligibilityAuditEvent.name),
          useValue: { create: createAudit },
        },
        {
          provide: TenantUserLookupService,
          useValue: {
            assertCollaboratorInTenant: assertCollab,
            listCollaboratorSummaries: listSummaries,
            getSummariesForUsers: getSummaries,
            getTenantUserBenefitSnapshot: getBenefitSnapshot,
          },
        },
      ],
    }).compile();
    service = module.get(EligibilityService);
  });

  it('removeEligible throws when no row', async () => {
    deleteOneElig.mockReturnValue({ exec: () => Promise.resolve({ deletedCount: 0 }) });
    const tid = new Types.ObjectId();
    const uid = new Types.ObjectId();
    await expect(
      service.removeEligible(tid, uid, 'actor'),
    ).rejects.toThrow(NotFoundException);
    expect(createAudit).not.toHaveBeenCalled();
  });

  it('removeEligible writes audit when deleted', async () => {
    const tid = new Types.ObjectId();
    const uid = new Types.ObjectId();
    await service.removeEligible(tid, uid, 'actor1');
    expect(createAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: tid,
        targetUserId: uid,
        actorSub: 'actor1',
        action: 'removed_eligible',
      }),
    );
  });

  it('markEligible calls assertCollaboratorInTenant', async () => {
    const tid = new Types.ObjectId();
    const uid = new Types.ObjectId();
    findOneElig
      .mockReturnValueOnce({ exec: () => Promise.resolve(null) })
      .mockReturnValue({
        lean: () => ({
          exec: () =>
            Promise.resolve({
              userId: uid,
              tenantId: tid,
              updatedBySub: 'hr1',
              updatedAt: new Date('2026-01-01'),
            }),
        }),
      });
    getSummaries.mockResolvedValue(
      new Map([[uid.toString(), { id: uid.toString(), email: 'e@x.com' }]]),
    );

    await service.markEligible(tid, uid, 'hr1');

    expect(assertCollab).toHaveBeenCalledWith(tid, uid);
    expect(createElig).toHaveBeenCalled();
    expect(createAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'marked_eligible' }),
    );
  });

  it('getSelfEligibilityStatus returns eligible when row exists', async () => {
    const tid = new Types.ObjectId();
    const uid = new Types.ObjectId();
    getBenefitSnapshot.mockResolvedValue({
      active: true,
      passwordSetRequired: false,
      isCollaborator: true,
    });
    findOneElig.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve({ _id: 'x' }) }),
    });
    const out = await service.getSelfEligibilityStatus({
      sub: uid.toString(),
      tenantId: tid.toString(),
      aud: 'ic-app',
      principalType: 'tenant_user',
      roles: ['collaborator'],
    });
    expect(out.status).toBe('eligible');
  });

  it('getSelfEligibilityStatus returns pending when passwordSetRequired', async () => {
    const tid = new Types.ObjectId();
    const uid = new Types.ObjectId();
    getBenefitSnapshot.mockResolvedValue({
      active: true,
      passwordSetRequired: true,
      isCollaborator: true,
    });
    const out = await service.getSelfEligibilityStatus({
      sub: uid.toString(),
      tenantId: tid.toString(),
      aud: 'ic-app',
      principalType: 'tenant_user',
      roles: ['collaborator'],
    });
    expect(out.status).toBe('pending');
  });

  it('assertBenefitAccessAllowed throws when not eligible', async () => {
    const tid = new Types.ObjectId();
    const uid = new Types.ObjectId();
    getBenefitSnapshot.mockResolvedValue({
      active: true,
      passwordSetRequired: false,
      isCollaborator: true,
    });
    findOneElig.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve(null) }),
    });
    await expect(
      service.assertBenefitAccessAllowed(tid, uid),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: BenefitErrorCodes.NOT_ELIGIBLE }),
    });
  });

  it('assertBenefitAccessAllowed throws ACCOUNT_INACTIVE', async () => {
    const tid = new Types.ObjectId();
    const uid = new Types.ObjectId();
    getBenefitSnapshot.mockResolvedValue({
      active: false,
      passwordSetRequired: false,
      isCollaborator: true,
    });
    await expect(service.assertBenefitAccessAllowed(tid, uid)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
