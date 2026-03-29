import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EmployeeEligibilityDocument = HydratedDocument<EmployeeEligibility>;

@Schema({ collection: 'employee_eligibility', timestamps: true })
export class EmployeeEligibility {
  @Prop({ type: Types.ObjectId, required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  createdBySub!: string;

  @Prop({ required: true })
  updatedBySub!: string;
}

export const EmployeeEligibilitySchema =
  SchemaFactory.createForClass(EmployeeEligibility);

EmployeeEligibilitySchema.index(
  { tenantId: 1, userId: 1 },
  { unique: true },
);
