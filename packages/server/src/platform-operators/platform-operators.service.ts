import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { assertPasswordPolicy } from '../auth/password-policy';
import { PlatformUser } from '../auth/schemas/platform-user.schema';
import type { CreatePlatformUserDto } from './dto/create-platform-user.dto';

@Injectable()
export class PlatformOperatorsService {
  constructor(
    @InjectModel(PlatformUser.name)
    private platformUserModel: Model<PlatformUser>,
    private readonly config: ConfigService,
    private readonly auth: AuthService,
  ) {}

  private bcryptRounds(): number {
    return Number(this.config.get('BCRYPT_ROUNDS') ?? 10);
  }

  async create(dto: CreatePlatformUserDto): Promise<{ id: string }> {
    assertPasswordPolicy(dto.password);
    const email = dto.email.toLowerCase().trim();
    const existing = await this.platformUserModel.findOne({ email }).exec();
    if (existing) {
      throw new ConflictException('Email already registered.');
    }
    for (const tid of dto.tenantIds ?? []) {
      if (!Types.ObjectId.isValid(tid)) {
        throw new BadRequestException('Invalid tenantIds entry.');
      }
    }
    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds());
    try {
      const doc = await this.platformUserModel.create({
        email,
        passwordHash,
        roles: dto.roles,
        active: true,
        serveAllTenants: dto.serveAllTenants ?? true,
        tenantIds: (dto.tenantIds ?? []).map((id) => new Types.ObjectId(id)),
      });
      return { id: (doc._id as Types.ObjectId).toString() };
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code?: number }).code === 11000
      ) {
        throw new ConflictException('Email already registered.');
      }
      throw e;
    }
  }

  async setActive(userId: string, active: boolean): Promise<{ ok: true }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user id.');
    }
    const uid = new Types.ObjectId(userId);
    const doc = await this.platformUserModel.findById(uid).exec();
    if (!doc) {
      throw new NotFoundException('Platform user not found.');
    }
    doc.active = active;
    await doc.save();
    if (!active) {
      await this.auth.revokeAllRefreshForUser('platform_user', uid);
    }
    return { ok: true };
  }
}
