import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InviteTokenDocument = HydratedDocument<InviteToken>;

@Schema({ collection: 'auth_invite_tokens', timestamps: true })
export class InviteToken {
  @Prop({ required: true })
  tokenHash!: string;

  @Prop({ type: Types.ObjectId, required: true })
  tenantUserId!: Types.ObjectId;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  consumedAt!: Date | null;
}

export const InviteTokenSchema = SchemaFactory.createForClass(InviteToken);

InviteTokenSchema.index({ tokenHash: 1 }, { unique: true });
