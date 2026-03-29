import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LoginFailureBucketDocument = HydratedDocument<LoginFailureBucket>;

@Schema({ collection: 'auth_login_failure_buckets', timestamps: true })
export class LoginFailureBucket {
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ default: 0 })
  count!: number;

  @Prop({ required: true })
  windowStarted!: Date;

  @Prop({ type: Date, default: null })
  lockedUntil!: Date | null;
}

export const LoginFailureBucketSchema =
  SchemaFactory.createForClass(LoginFailureBucket);
