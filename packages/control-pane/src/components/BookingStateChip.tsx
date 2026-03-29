import { Chip, type ChipProps } from '@mui/material';
import type { BookingState } from '@planning-monefica/shared-types';
import { bookingStatePresentation } from '@planning-monefica/shared-types';

const LABEL_EN: Record<BookingState, string> = {
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  no_show: 'No-show',
  completed: 'Completed',
};

export type BookingStateChipProps = {
  state: BookingState;
} & Omit<ChipProps, 'label' | 'color'>;

/** UX-DR6 / DR9 — booking state chip for consultant surfaces. */
export function BookingStateChip({ state, sx, ...rest }: BookingStateChipProps) {
  const { backgroundColor, color } = bookingStatePresentation(state);
  return (
    <Chip
      size="small"
      label={LABEL_EN[state]}
      sx={[
        { backgroundColor, color, fontWeight: 700 },
        ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
      ]}
      {...rest}
    />
  );
}
