import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SchedulingBookingAuditDocument = HydratedDocument<SchedulingBookingAudit>;

/** SCHED-NFR3 — assignment + closure audit trail. */
@Schema({ collection: 'scheduling_booking_audits', timestamps: true })
export class SchedulingBookingAudit {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  bookingId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  actorSub!: string;

  @Prop({ type: String, required: true })
  action!: 'booking_assigned' | 'booking_closed';

  @Prop({ type: String })
  outcome?: string;

  @Prop({ type: String })
  reasonCode?: string;
}

export const SchedulingBookingAuditSchema =
  SchemaFactory.createForClass(SchedulingBookingAudit);
