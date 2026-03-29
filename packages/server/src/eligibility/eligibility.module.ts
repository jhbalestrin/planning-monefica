import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { BenefitEligibilityGuard } from './benefit-eligibility.guard';
import { EligibilityController } from './eligibility.controller';
import { EligibilityService } from './eligibility.service';
import { EmployeeEligibility, EmployeeEligibilitySchema } from './schemas/employee-eligibility.schema';
import {
  EligibilityAuditEvent,
  EligibilityAuditEventSchema,
} from './schemas/eligibility-audit-event.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: EmployeeEligibility.name, schema: EmployeeEligibilitySchema },
      {
        name: EligibilityAuditEvent.name,
        schema: EligibilityAuditEventSchema,
      },
    ]),
  ],
  controllers: [EligibilityController],
  providers: [EligibilityService, BenefitEligibilityGuard],
  exports: [EligibilityService, BenefitEligibilityGuard],
})
export class EligibilityModule {}
