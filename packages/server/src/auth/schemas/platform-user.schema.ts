import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { AuthRole } from '@planning-monefica/shared-types';

export type PlatformUserDocument = HydratedDocument<PlatformUser>;

@Schema({ collection: 'platform_users', timestamps: true })
export class PlatformUser {
  @Prop({ required: true, lowercase: true, trim: true, unique: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ type: [String], required: true })
  roles!: AuthRole[];

  @Prop({ default: true })
  active!: boolean;

  /** AD-SCHED-001 */
  @Prop({ default: true })
  serveAllTenants!: boolean;

  @Prop({ type: [Types.ObjectId], default: [] })
  tenantIds!: Types.ObjectId[];
}

export const PlatformUserSchema = SchemaFactory.createForClass(PlatformUser);
