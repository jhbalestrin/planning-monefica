import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { AuthRole } from '@planning-monefica/shared-types';

export type TenantUserDocument = HydratedDocument<TenantUser>;

@Schema({ collection: 'tenant_users', timestamps: true })
export class TenantUser {
  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ type: [String], required: true })
  roles!: AuthRole[];

  @Prop({ type: Types.ObjectId, required: true })
  tenantId!: Types.ObjectId;

  @Prop({ default: true })
  active!: boolean;

  @Prop({ default: false })
  passwordSetRequired!: boolean;
}

export const TenantUserSchema = SchemaFactory.createForClass(TenantUser);

TenantUserSchema.index({ email: 1 }, { unique: true });
