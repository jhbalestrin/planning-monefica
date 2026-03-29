import { Chip } from '@mui/material';
import type { BenefitEligibilityStatus } from '@planning-monefica/shared-types';
import { benefitEligibilityStatusPresentation } from '@planning-monefica/shared-types';

const LABEL_EN: Record<BenefitEligibilityStatus, string> = {
  eligible: 'Eligible',
  not_eligible: 'Not eligible',
  pending: 'Pending',
};

export type BenefitEligibilityStatusChipProps = {
  status: BenefitEligibilityStatus;
};

/** UX-DR6 — enum-driven MUI chip; colors from shared `statusPresentation` (UX-DR9). */
export function BenefitEligibilityStatusChip({ status }: BenefitEligibilityStatusChipProps) {
  const { backgroundColor, color } = benefitEligibilityStatusPresentation(status);
  return (
    <Chip
      size="small"
      label={LABEL_EN[status]}
      sx={{
        backgroundColor,
        color,
        fontWeight: 600,
      }}
    />
  );
}
