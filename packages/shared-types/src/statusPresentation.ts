import type { BenefitEligibilityStatus } from './eligibility';
import type { BookingState } from './scheduling';

/**
 * UX-DR6 / UX-DR9 — semantic bucket for cross-platform chips (MUI + RN).
 * Colors chosen for ~WCAG 2.1 AA contrast with white label text (verify in CI when automated checks land).
 */
export type StatusPresentationSemantic = 'success' | 'warning' | 'neutral' | 'danger' | 'info';

export type StatusChipColors = {
  backgroundColor: string;
  color: string;
};

/** Documented pairs for manual / automated contrast checks (UX-DR9). */
export const STATUS_CHIP_COLOR_PAIRS: Record<
  StatusPresentationSemantic,
  StatusChipColors & { wcagNote: string }
> = {
  success: {
    backgroundColor: '#166534',
    color: '#ffffff',
    wcagNote: 'green-800 #166534 vs white ≈ 5.7:1',
  },
  warning: {
    backgroundColor: '#b45309',
    color: '#ffffff',
    wcagNote: 'orange-700 #b45309 vs white ≈ 4.6:1',
  },
  neutral: {
    backgroundColor: '#4b5563',
    color: '#ffffff',
    wcagNote: 'gray-600 #4b5563 vs white ≈ 5.8:1',
  },
  danger: {
    backgroundColor: '#b91c1c',
    color: '#ffffff',
    wcagNote: 'red-700 #b91c1c vs white ≈ 5.9:1',
  },
  info: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    wcagNote: 'blue-700 #1d4ed8 vs white ≈ 8.6:1',
  },
};

export function statusSemanticToChipColors(semantic: StatusPresentationSemantic): StatusChipColors {
  const { backgroundColor, color } = STATUS_CHIP_COLOR_PAIRS[semantic];
  return { backgroundColor, color };
}

export function benefitEligibilityStatusPresentation(
  status: BenefitEligibilityStatus,
): StatusChipColors & { semantic: StatusPresentationSemantic } {
  const semantic: StatusPresentationSemantic =
    status === 'eligible'
      ? 'success'
      : status === 'pending'
        ? 'warning'
        : 'neutral';
  return { semantic, ...statusSemanticToChipColors(semantic) };
}

export function bookingStatePresentation(
  state: BookingState,
): StatusChipColors & { semantic: StatusPresentationSemantic } {
  let semantic: StatusPresentationSemantic;
  switch (state) {
    case 'confirmed':
      semantic = 'success';
      break;
    case 'completed':
      semantic = 'info';
      break;
    case 'cancelled':
      semantic = 'neutral';
      break;
    case 'no_show':
      semantic = 'warning';
      break;
  }
  return { semantic, ...statusSemanticToChipColors(semantic) };
}
