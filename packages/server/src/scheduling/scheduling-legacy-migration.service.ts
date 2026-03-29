import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from './schemas/booking.schema';

/**
 * One-time style migration: legacy bookings (pre–Epic 7) get
 * `awaitingAssignment: false` and `assignedConsultantId` = slot owner.
 */
@Injectable()
export class SchedulingLegacyMigrationService implements OnModuleInit {
  private readonly log = new Logger(SchedulingLegacyMigrationService.name);

  constructor(@InjectModel(Booking.name) private readonly bookingModel: Model<Booking>) {}

  async onModuleInit(): Promise<void> {
    try {
      const res = await this.bookingModel.collection.updateMany(
        { awaitingAssignment: { $exists: false } },
        [
          {
            $set: {
              awaitingAssignment: false,
              assignedConsultantId: '$consultantId',
            },
          },
        ],
      );
      if (res.modifiedCount > 0) {
        this.log.log(`Backfilled ${String(res.modifiedCount)} legacy booking(s) for assignment fields.`);
      }
    } catch (e) {
      this.log.warn(
        `Booking assignment backfill skipped or failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}
