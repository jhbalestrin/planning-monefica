import type { CalendarRangeParams } from './api/schedulingApi';

/** Next 7 days from start of today (UTC), inclusive window for list/calendar MVP. */
export function rollingWeekRangeUtc(): CalendarRangeParams {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { fromUtc: start.toISOString(), toUtc: end.toISOString() };
}

export function rangeLabelText(r: CalendarRangeParams): string {
  return `${r.fromUtc.slice(0, 10)} → ${r.toUtc.slice(0, 10)} (UTC)`;
}
