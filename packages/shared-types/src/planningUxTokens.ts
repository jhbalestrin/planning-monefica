/**
 * UX-DR4 — layout and scale tokens for hr-admin + control-pane (MUI `spacing` / `shape` / pilots).
 * Keep magic layout numbers out of feature views; import `PLANNING_WEB_UX` instead.
 */
export const PLANNING_WEB_UX = {
  spacingUnitPx: 8,
  radiusSmPx: 8,
  radiusMdPx: 12,
  layout: {
    pageMaxWidthLg: 1200,
    pageMaxWidthMd: 960,
    pageMaxWidthScheduling: 720,
  },
  table: {
    minWidthWide: 720,
    stickyPrimaryColumnMinWidth: 200,
    colLastUpdatedMinWidth: 160,
    colUpdatedByMinWidth: 140,
    colActionsMinWidth: 120,
    colStatusMinWidth: 100,
  },
} as const;
