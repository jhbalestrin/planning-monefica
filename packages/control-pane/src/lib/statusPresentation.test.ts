import { describe, expect, it } from 'vitest';
import {
  STATUS_CHIP_COLOR_PAIRS,
  benefitEligibilityStatusPresentation,
  bookingStatePresentation,
} from '@planning-monefica/shared-types';

describe('statusPresentation (UX-DR6/DR9)', () => {
  it('maps booking states to chip colors', () => {
    const confirmed = bookingStatePresentation('confirmed');
    expect(confirmed.semantic).toBe('success');
    expect(confirmed.backgroundColor).toBe(STATUS_CHIP_COLOR_PAIRS.success.backgroundColor);
    expect(confirmed.color).toBe('#ffffff');
  });

  it('maps benefit eligibility to chip colors', () => {
    const eligible = benefitEligibilityStatusPresentation('eligible');
    expect(eligible.semantic).toBe('success');
    expect(eligible.backgroundColor).toMatch(/^#/);
  });

  it('documents WCAG notes for each semantic', () => {
    for (const key of Object.keys(STATUS_CHIP_COLOR_PAIRS) as Array<
      keyof typeof STATUS_CHIP_COLOR_PAIRS
    >) {
      expect(STATUS_CHIP_COLOR_PAIRS[key].wcagNote.length).toBeGreaterThan(10);
    }
  });
});
