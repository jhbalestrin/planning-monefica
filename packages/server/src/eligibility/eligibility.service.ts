import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  AccessTokenPayload,
  EligibilityCollaboratorOptionDto,
  EligibilityListItemDto,
  EligibilitySelfStatusDto,
} from '@planning-monefica/shared-types';
import {
  AuthErrorCodes,
  BenefitErrorCodes,
} from '@planning-monefica/shared-types';
import { Model, Types } from 'mongoose';
import { TenantUserLookupService } from '../auth/tenant-user-lookup.service';
import { EmployeeEligibility } from './schemas/employee-eligibility.schema';
import {
  EligibilityAuditEvent,
  type EligibilityAuditAction,
} from './schemas/eligibility-audit-event.schema';

@Injectable()
export class EligibilityService {
  constructor(
    @InjectModel(EmployeeEligibility.name)
    private eligModel: Model<EmployeeEligibility>,
    @InjectModel(EligibilityAuditEvent.name)
    private auditModel: Model<EligibilityAuditEvent>,
    private readonly tenantUsers: TenantUserLookupService,
  ) {}

  async getSelfEligibilityStatus(
    user: AccessTokenPayload,
  ): Promise<EligibilitySelfStatusDto> {
    if (user.principalType !== 'tenant_user' || !user.tenantId) {
      throw new UnauthorizedException({
        message: 'Invalid session for this resource.',
        code: AuthErrorCodes.UNAUTHORIZED,
      });
    }
    const tenantId = new Types.ObjectId(user.tenantId);
    const userId = new Types.ObjectId(user.sub);
    const snap = await this.tenantUsers.getTenantUserBenefitSnapshot(
      tenantId,
      userId,
    );
    if (!snap) {
      throw new UnauthorizedException({
        message: 'User not found for tenant.',
        code: AuthErrorCodes.UNAUTHORIZED,
      });
    }
    if (!snap.isCollaborator) {
      throw new ForbiddenException({
        message: 'Only collaborators can view benefit status here.',
        code: AuthErrorCodes.FORBIDDEN,
      });
    }
    if (!snap.active) {
      return { status: 'not_eligible' };
    }
    if (snap.passwordSetRequired) {
      return { status: 'pending' };
    }
    const row = await this.eligModel
      .findOne({ tenantId, userId })
      .lean()
      .exec();
    return { status: row ? 'eligible' : 'not_eligible' };
  }

  /**
   * Benefit-scoped routes (ELIG-FR10 order: after auth + tenant binding).
   * ELIG-FR11: inactive never passes.
   */
  async assertBenefitAccessAllowed(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    const snap = await this.tenantUsers.getTenantUserBenefitSnapshot(
      tenantId,
      userId,
    );
    if (!snap || !snap.isCollaborator) {
      throw new ForbiddenException({
        message: 'Benefit access denied.',
        code: BenefitErrorCodes.NOT_ELIGIBLE,
      });
    }
    if (!snap.active) {
      throw new ForbiddenException({
        message: 'Account is inactive.',
        code: BenefitErrorCodes.ACCOUNT_INACTIVE,
      });
    }
    if (snap.passwordSetRequired) {
      throw new ForbiddenException({
        message: 'Complete password setup before using benefits.',
        code: BenefitErrorCodes.ONBOARDING_PENDING,
      });
    }
    const row = await this.eligModel.findOne({ tenantId, userId }).lean().exec();
    if (!row) {
      throw new ForbiddenException({
        message: 'You are not eligible for this benefit.',
        code: BenefitErrorCodes.NOT_ELIGIBLE,
      });
    }
  }

  private async writeAudit(
    tenantId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    actorSub: string,
    action: EligibilityAuditAction,
  ): Promise<void> {
    await this.auditModel.create({
      tenantId,
      targetUserId,
      actorSub,
      action,
    });
  }

  async listForTenant(
    tenantId: Types.ObjectId,
  ): Promise<EligibilityListItemDto[]> {
    const rows = await this.eligModel
      .find({ tenantId })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
    const ids = rows.map((r) => r.userId as Types.ObjectId);
    const summaries = await this.tenantUsers.getSummariesForUsers(
      tenantId,
      ids,
    );
    return rows.map((r) => {
      const uid = (r.userId as Types.ObjectId).toString();
      const sum = summaries.get(uid);
      const ts = (r as { updatedAt?: unknown }).updatedAt;
      const updatedAt =
        ts instanceof Date ? ts.toISOString() : new Date().toISOString();
      return {
        userId: uid,
        email: sum?.email ?? '(unknown)',
        updatedAt,
        updatedBySub: r.updatedBySub,
      };
    });
  }

  async listCollaboratorsForPicker(
    tenantId: Types.ObjectId,
    excludeEligible: boolean,
  ): Promise<EligibilityCollaboratorOptionDto[]> {
    const all = await this.tenantUsers.listCollaboratorSummaries(tenantId);
    if (!excludeEligible) {
      return all.map((a) => ({ userId: a.id, email: a.email }));
    }
    const eligibleIds = new Set(
      (
        await this.eligModel
          .find({ tenantId })
          .select({ userId: 1 })
          .lean()
          .exec()
      ).map((e) => (e.userId as Types.ObjectId).toString()),
    );
    return all
      .filter((a) => !eligibleIds.has(a.id))
      .map((a) => ({ userId: a.id, email: a.email }));
  }

  async markEligible(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    actorSub: string,
  ): Promise<EligibilityListItemDto> {
    await this.tenantUsers.assertCollaboratorInTenant(tenantId, userId);
    const now = new Date();
    const existing = await this.eligModel
      .findOne({ tenantId, userId })
      .exec();
    if (!existing) {
      await this.eligModel.create({
        tenantId,
        userId,
        createdBySub: actorSub,
        updatedBySub: actorSub,
      });
    } else {
      existing.updatedBySub = actorSub;
      await existing.save();
    }
    await this.writeAudit(tenantId, userId, actorSub, 'marked_eligible');
    const row = await this.eligModel.findOne({ tenantId, userId }).lean().exec();
    if (!row) {
      throw new ConflictException('Eligibility persist failed.');
    }
    const map = await this.tenantUsers.getSummariesForUsers(tenantId, [userId]);
    const uid = userId.toString();
    const ts = (row as { updatedAt?: unknown }).updatedAt;
    const updatedAt =
      ts instanceof Date ? ts.toISOString() : now.toISOString();
    return {
      userId: uid,
      email: map.get(uid)?.email ?? '(unknown)',
      updatedAt,
      updatedBySub: row.updatedBySub,
    };
  }

  async removeEligible(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    actorSub: string,
  ): Promise<{ ok: true }> {
    const res = await this.eligModel.deleteOne({ tenantId, userId }).exec();
    if (res.deletedCount === 0) {
      throw new NotFoundException('Eligibility record not found.');
    }
    await this.writeAudit(tenantId, userId, actorSub, 'removed_eligible');
    return { ok: true };
  }
}
