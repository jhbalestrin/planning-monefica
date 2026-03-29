import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { AuthRole } from '@planning-monefica/shared-types';
import { Model, Types } from 'mongoose';
import { PlatformUser } from './schemas/platform-user.schema';

export type ConsultantSchedulingScope = {
  serveAllTenants: boolean;
  tenantIds: Types.ObjectId[];
  roles: AuthRole[];
  active: boolean;
};

/**
 * AD-SCHED-001 — scheduling authorizes tenant scope from **PlatformUser** DB row, not JWT alone.
 */
@Injectable()
export class PlatformUserLookupService {
  constructor(
    @InjectModel(PlatformUser.name) private platformUserModel: Model<PlatformUser>,
  ) {}

  async getConsultantSchedulingScope(
    platformUserId: Types.ObjectId,
  ): Promise<ConsultantSchedulingScope | null> {
    const doc = await this.platformUserModel.findById(platformUserId).lean().exec();
    if (!doc) {
      return null;
    }
    return {
      serveAllTenants: Boolean(doc.serveAllTenants),
      tenantIds: (doc.tenantIds ?? []) as Types.ObjectId[],
      roles: doc.roles as AuthRole[],
      active: Boolean(doc.active),
    };
  }

  assertTenantAllowedForConsultant(
    scope: ConsultantSchedulingScope,
    tenantId: Types.ObjectId,
  ): boolean {
    if (!scope.active) {
      return false;
    }
    if (scope.serveAllTenants) {
      return true;
    }
    return scope.tenantIds.some((id) => id.equals(tenantId));
  }
}
