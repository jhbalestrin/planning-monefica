import { subtractIntervals } from './interval.util';

describe('subtractIntervals', () => {
  it('returns full range when no cuts', () => {
    const r = subtractIntervals(0, 100, []);
    expect(r).toEqual([{ startMs: 0, endMs: 100 }]);
  });

  it('removes interior cut', () => {
    const r = subtractIntervals(0, 100, [{ startMs: 30, endMs: 70 }]);
    expect(r).toEqual([
      { startMs: 0, endMs: 30 },
      { startMs: 70, endMs: 100 },
    ]);
  });

  it('clips cuts to range', () => {
    const r = subtractIntervals(10, 50, [{ startMs: 0, endMs: 200 }]);
    expect(r).toEqual([]);
  });

  it('merges overlapping cuts implicitly via sequential subtract', () => {
    const r = subtractIntervals(0, 100, [
      { startMs: 20, endMs: 40 },
      { startMs: 35, endMs: 60 },
    ]);
    expect(r).toEqual([
      { startMs: 0, endMs: 20 },
      { startMs: 60, endMs: 100 },
    ]);
  });
});
