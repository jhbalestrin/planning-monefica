import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { BookingClosureReasonCode, BookingState } from '@planning-monefica/shared-types';
import { HydratedDocument, Types } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

/** Shared booking truth (SCHED-FR14); UTC instants (SCHED-NFR4). Epic 7 assignment. */
@Schema({ collection: 'bookings', timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  employeeUserId!: Types.ObjectId;

  /** Calendar / slot owner (resource) — Epic 6 slot choice. */
  @Prop({ type: Types.ObjectId, required: true, index: true })
  consultantId!: Types.ObjectId;

  @Prop({ type: Date, required: true })
  slotStartUtc!: Date;

  @Prop({ type: Date, required: true })
  slotEndUtc!: Date;

  @Prop({
    type: String,
    enum: ['confirmed', 'cancelled', 'no_show', 'completed'],
    required: true,
    default: 'confirmed',
  })
  state!: BookingState;

  /** SCHED-FR9 — true until slot-owning consultant claims (SCHED-FR10). */
  @Prop({ type: Boolean, required: true, default: true })
  awaitingAssignment!: boolean;

  /** Null while awaiting claim; set to claiming consultant. */
  @Prop({ type: Types.ObjectId, default: null })
  assignedConsultantId!: Types.ObjectId | null;

  @Prop({
    type: String,
    enum: [
      'delivered_completed',
      'client_cancelled',
      'consultant_cancelled',
      'no_show_employee',
      'no_show_other',
    ],
  })
  closureReasonCode?: BookingClosureReasonCode | null;

  @Prop({ type: String })
  idempotencyKey?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

/** SCHED-NFR1 / architecture: one confirmed booking per consultant slot start. */
BookingSchema.index(
  { consultantId: 1, slotStartUtc: 1 },
  {
    unique: true,
    partialFilterExpression: { state: 'confirmed' },
    name: 'booking_consultant_slot_unique_confirmed',
  },
);
