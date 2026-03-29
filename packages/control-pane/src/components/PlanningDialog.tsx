import MuiDialog, { type DialogProps } from '@mui/material/Dialog';

/** UX-DR10 — shared defaults on top of MUI focus trap + Escape-to-close. */
export function PlanningDialog({
  scroll = 'paper',
  disableEscapeKeyDown = false,
  ...props
}: DialogProps) {
  return (
    <MuiDialog
      scroll={scroll}
      disableEscapeKeyDown={disableEscapeKeyDown}
      {...props}
    />
  );
}
