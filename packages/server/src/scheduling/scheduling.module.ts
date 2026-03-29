import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { DenyHrAdminConsultantSchedulingGuard } from './guards/deny-hr-admin-consultant-scheduling.guard';
import { Booking, BookingSchema } from './schemas/booking.schema';
import {
  SchedulingBookingAudit,
  SchedulingBookingAuditSchema,
} from './schemas/scheduling-booking-audit.schema';
import {
  ConsultantAvailabilityBlock,
  ConsultantAvailabilityBlockSchema,
} from './schemas/consultant-availability-block.schema';
import {
  SchedulingIdempotency,
  SchedulingIdempotencySchema,
} from './schemas/scheduling-idempotency.schema';
import { SchedulingConsultantController } from './scheduling-consultant.controller';
import { SchedulingLegacyMigrationService } from './scheduling-legacy-migration.service';
import { SchedulingService } from './scheduling.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: ConsultantAvailabilityBlock.name, schema: ConsultantAvailabilityBlockSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: SchedulingIdempotency.name, schema: SchedulingIdempotencySchema },
      {
        name: SchedulingBookingAudit.name,
        schema: SchedulingBookingAuditSchema,
      },
    ]),
  ],
  controllers: [SchedulingConsultantController],
  providers: [
    SchedulingService,
    SchedulingLegacyMigrationService,
    DenyHrAdminConsultantSchedulingGuard,
  ],
  exports: [SchedulingService],
})
export class SchedulingModule {}
