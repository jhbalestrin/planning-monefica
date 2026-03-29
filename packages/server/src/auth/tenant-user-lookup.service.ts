import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { AuthRole } from '@planning-monefica/shared-types';
import { Model, Types } from 'mongoose';
import { TenantUser } from './schemas/tenant-user.schema';

export type TenantUserSummary = { id: string; email: string };

export type TenantUserBenefitSnapshot = {
  active: boolean;
  passwordSetRequired: boolean;
  isCollaborator: boolean;
};

@Injectable()
export class TenantUserLookupService {
  constructor(
    @InjectModel(TenantUser.name) private tenantUserModel: Model<TenantUser>,
  ) {}

  async assertCollaboratorInTenant(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    const doc = await this.tenantUserModel
      .findOne({
        _id: userId,
        tenantId,
        active: true,
        roles: { $in: ['collaborator'] },
      })
      .exec();
    if (!doc) {
      throw new NotFoundException(
        'Collaborator not found in this tenant or inactive.',
      );
    }
  }

  async listCollaboratorSummaries(
    tenantId: Types.ObjectId,
  ): Promise<TenantUserSummary[]> {
    const docs = await this.tenantUserModel
      .find({
        tenantId,
        active: true,
        roles: { $in: ['collaborator'] },
      })
      .select({ _id: 1, email: 1 })
      .lean()
      .exec();
    return docs.map((d) => ({
      id: (d._id as Types.ObjectId).toString(),
      email: d.email,
    }));
  }

  async getTenantUserBenefitSnapshot(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<TenantUserBenefitSnapshot | null> {
    const doc = await this.tenantUserModel
      .findOne({ _id: userId, tenantId })
      .lean()
      .exec();
    if (!doc) {
      return null;
    }
    const roles = doc.roles as AuthRole[];
    return {
      active: Boolean(doc.active),
      passwordSetRequired: Boolean(doc.passwordSetRequired),
      isCollaborator: roles.includes('collaborator'),
    };
  }

  async getSummariesForUsers(
    tenantId: Types.ObjectId,
    userIds: Types.ObjectId[],
  ): Promise<Map<string, TenantUserSummary>> {
    if (userIds.length === 0) {
      return new Map();
    }
    const docs = await this.tenantUserModel
      .find({ _id: { $in: userIds }, tenantId })
      .select({ _id: 1, email: 1 })
      .lean()
      .exec();
    const m = new Map<string, TenantUserSummary>();
    for (const d of docs) {
      const id = (d._id as Types.ObjectId).toString();
      m.set(id, { id, email: d.email });
    }
    return m;
  }
}
