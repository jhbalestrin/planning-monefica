import MuiDialog, { type DialogProps } from '@mui/material/Dialog';

/**
 * UX-DR10 baseline — MUI `Dialog` traps focus and closes on Escape when `onClose` is set.
 * Pins shared defaults for eligibility / destructive flows (Epic 3.4).
 */
export function PlanningDialog({
  scroll = 'paper',
  disableEscapeKeyDown = false,
  ...props
}: DialogProps) {
  return (
    <MuiDialog scroll={scroll} disableEscapeKeyDown={disableEscapeKeyDown} {...props} />
  );
}
