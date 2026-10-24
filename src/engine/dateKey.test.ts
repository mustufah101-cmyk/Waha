import { describe, it, expect } from 'vitest';
import { getHydrationDateKey, getPast7DateKeys } from './dateKey.ts';

describe('dateKey (Next-Iftar Rollover)', () => {
  const iftarTime = '18:30';

  it('assigns post-iftar evening timestamp to today', () => {
    // Oct 24, 2026 at 19:00
    const d = new Date(2026, 9, 24, 19, 0, 0);
    expect(getHydrationDateKey(d.getTime(), iftarTime)).toBe('2026-10-24');
  });

  it('assigns post-midnight hours (suhoor time) to the same iftar cycle', () => {
    // Oct 25, 2026 at 02:30 AM
    const d = new Date(2026, 9, 25, 2, 30, 0);
    expect(getHydrationDateKey(d.getTime(), iftarTime)).toBe('2026-10-24');
  });

  it('assigns daytime hours before next iftar to the current cycle', () => {
    // Oct 25, 2026 at 14:00 (2 PM)
    const d = new Date(2026, 9, 25, 14, 0, 0);
    expect(getHydrationDateKey(d.getTime(), iftarTime)).toBe('2026-10-24');
  });

  it('rolls over to next cycle at next iftar', () => {
    // Oct 25, 2026 at 18:30 (next iftar)
    const d = new Date(2026, 9, 25, 18, 30, 0);
    expect(getHydrationDateKey(d.getTime(), iftarTime)).toBe('2026-10-25');
  });

  it('generates 7 consecutive date keys ending in current key', () => {
    const keys = getPast7DateKeys('2026-10-24');
    expect(keys).toHaveLength(7);
    expect(keys[6]).toBe('2026-10-24');
    expect(keys[0]).toBe('2026-10-18');
  });
});
