/** Half-open style not used; all comparisons [start, end) with start < end. */

export type UtcInterval = { startMs: number; endMs: number };

function subtractOne(
  free: UtcInterval,
  cut: UtcInterval,
): UtcInterval[] {
  if (cut.endMs <= free.startMs || cut.startMs >= free.endMs) {
    return [free];
  }
  const out: UtcInterval[] = [];
  if (cut.startMs > free.startMs) {
    out.push({ startMs: free.startMs, endMs: Math.min(cut.startMs, free.endMs) });
  }
  if (cut.endMs < free.endMs) {
    out.push({ startMs: Math.max(cut.endMs, free.startMs), endMs: free.endMs });
  }
  return out.filter((x) => x.startMs < x.endMs);
}

/**
 * Returns sub-intervals of [rangeStart, rangeEnd] after removing overlaps with `cuts`
 * (clipped to the range). Cuts may be unsorted.
 */
export function subtractIntervals(
  rangeStartMs: number,
  rangeEndMs: number,
  cuts: UtcInterval[],
): UtcInterval[] {
  if (!(rangeStartMs < rangeEndMs)) {
    return [];
  }
  const clipped = cuts
    .map((c) => ({
      startMs: Math.max(c.startMs, rangeStartMs),
      endMs: Math.min(c.endMs, rangeEndMs),
    }))
    .filter((c) => c.startMs < c.endMs)
    .sort((a, b) => a.startMs - b.startMs);

  let free: UtcInterval[] = [{ startMs: rangeStartMs, endMs: rangeEndMs }];
  for (const cut of clipped) {
    free = free.flatMap((f) => subtractOne(f, cut));
  }
  return free;
}
