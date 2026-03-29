import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  EligibilityCollaboratorOptionDto,
  EligibilityListItemDto,
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
