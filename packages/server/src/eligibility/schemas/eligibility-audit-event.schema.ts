import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EligibilityAuditAction = 'marked_eligible' | 'removed_eligible';

export type EligibilityAuditEventDocument =
  HydratedDocument<EligibilityAuditEvent>;

@Schema({
  collection: 'eligibility_audit_events',
  timestamps: { createdAt: true, updatedAt: false },
})
export class EligibilityAuditEvent {
  @Prop({ type: Types.ObjectId, required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  targetUserId!: Types.ObjectId;

  @Prop({ required: true })
  actorSub!: string;

  @Prop({ type: String, required: true })
  action!: EligibilityAuditAction;
}

export const EligibilityAuditEventSchema = SchemaFactory.createForClass(
  EligibilityAuditEvent,
);

EligibilityAuditEventSchema.index({ tenantId: 1, createdAt: -1 });
