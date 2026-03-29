import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SchedulingIdempotencyDocument = HydratedDocument<SchedulingIdempotency>;

/** SCHED-NFR5 — dedupe booking create/reschedule retries; TTL via index. */
@Schema({ collection: 'scheduling_idempotency', timestamps: true })
export class SchedulingIdempotency {
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ type: Types.ObjectId, required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  employeeUserId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  operation!: string;

  @Prop({ type: Types.ObjectId, required: true })
  bookingId!: Types.ObjectId;
}

export const SchedulingIdempotencySchema =
  SchemaFactory.createForClass(SchedulingIdempotency);

SchedulingIdempotencySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400, name: 'scheduling_idempotency_ttl' },
);
