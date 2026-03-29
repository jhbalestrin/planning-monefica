import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { AuthClientId, PrincipalType } from '@planning-monefica/shared-types';

export type PasswordResetTokenDocument = HydratedDocument<PasswordResetToken>;

@Schema({ collection: 'auth_password_reset_tokens', timestamps: true })
export class PasswordResetToken {
  @Prop({ required: true })
  tokenHash!: string;

  @Prop({ type: String, required: true })
  principalType!: PrincipalType;

  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  clientId!: AuthClientId;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  consumedAt!: Date | null;
}

export const PasswordResetTokenSchema =
  SchemaFactory.createForClass(PasswordResetToken);

PasswordResetTokenSchema.index({ tokenHash: 1 }, { unique: true });
