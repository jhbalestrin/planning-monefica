/**
 * UX-DR5 — single spacing scale + type roles before a full RN design system.
 * Touch targets: UX spec §6 — minimum 44×44 pt for primary actions.
 */
export const PLANNING_MOBILE_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

export const PLANNING_MOBILE_RADIUS = {
  card: 12,
  chip: 999,
  banner: 8,
} as const;

export const PLANNING_MOBILE_TYPE = {
  title: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  section: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  meta: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  chip: { fontSize: 12, fontWeight: '700' as const },
  link: { fontSize: 14, fontWeight: '600' as const },
} as const;

/** Minimum tappable height (React Native density-independent pixels). */
export const PLANNING_MIN_TOUCH_TARGET = 44;
