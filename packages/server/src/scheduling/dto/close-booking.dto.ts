import { IsIn, IsString } from 'class-validator';
import type { BookingClosureReasonCode } from '@planning-monefica/shared-types';

const OUTCOMES = ['completed', 'cancelled', 'no_show'] as const;

const REASONS: BookingClosureReasonCode[] = [
  'delivered_completed',
  'client_cancelled',
  'consultant_cancelled',
  'no_show_employee',
  'no_show_other',
];

export class CloseBookingDto {
  @IsIn(OUTCOMES)
  outcome!: (typeof OUTCOMES)[number];

  @IsString()
  @IsIn(REASONS)
  reasonCode!: BookingClosureReasonCode;
}
