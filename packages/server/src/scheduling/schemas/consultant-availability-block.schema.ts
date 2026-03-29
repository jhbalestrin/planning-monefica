import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConsultantAvailabilityBlockDocument =
  HydratedDocument<ConsultantAvailabilityBlock>;

/** Consultant-offered windows per tenant (SCHED-FR1); instants UTC (SCHED-NFR4). */
@Schema({ collection: 'consultant_availability_blocks', timestamps: true })
export class ConsultantAvailabilityBlock {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  consultantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Date, required: true })
  startUtc!: Date;

  @Prop({ type: Date, required: true })
  endUtc!: Date;
}

export const ConsultantAvailabilityBlockSchema = SchemaFactory.createForClass(
  ConsultantAvailabilityBlock,
);

ConsultantAvailabilityBlockSchema.index(
  { consultantId: 1, startUtc: 1, endUtc: 1 },
  { name: 'consultant_availability_window' },
);
