import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { TenantUser } from '../auth/schemas/tenant-user.schema';

@Injectable()
export class HrService {
  constructor(
    @InjectModel(TenantUser.name) private tenantUserModel: Model<TenantUser>,
    private readonly auth: AuthService,
  ) {}

  async setTenantUserActive(
    tenantId: string,
    userId: string,
    active: boolean,
  ): Promise<{ ok: true }> {
    if (!Types.ObjectId.isValid(tenantId) || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid id.');
    }
    const tid = new Types.ObjectId(tenantId);
    const uid = new Types.ObjectId(userId);
    const doc = await this.tenantUserModel
      .findOne({ _id: uid, tenantId: tid })
      .exec();
    if (!doc) {
      throw new NotFoundException('User not found in this tenant.');
    }
    doc.active = active;
    await doc.save();
    if (!active) {
      await this.auth.revokeAllRefreshForUser('tenant_user', uid);
    }
    return { ok: true };
  }
}
