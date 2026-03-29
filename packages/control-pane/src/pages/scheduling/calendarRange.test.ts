import { describe, expect, it } from 'vitest';
import { rollingWeekRangeUtc } from './calendarRange';

describe('rollingWeekRangeUtc', () => {
  it('returns a 7-day UTC window with end after start', () => {
    const r = rollingWeekRangeUtc();
    const from = new Date(r.fromUtc).getTime();
    const to = new Date(r.toUtc).getTime();
    expect(to).toBeGreaterThan(from);
    expect(to - from).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
