import { describe, it, expect } from 'vitest';
import { generateRamadanSchedule } from './ramadanScheduler.ts';

describe('ramadanScheduler', () => {
  const standardWindow = {
    iftarTime: '18:30',
    suhoorTime: '05:00', // 10.5 hours (630 min)
  };

  const eveningTime = new Date('2026-10-24T19:00:00'); // 7:00 PM (night state)
  const daytimeFasting = new Date('2026-10-24T14:00:00'); // 2:00 PM (daytime fasting)

  it('asserts 0.612 L (displayed 0.61 L) at iftar for 70 kg Hot (3.06 L profile) with no clamp', () => {
    const schedule = generateRamadanSchedule(3.06, standardWindow, [], eveningTime);
    expect(schedule.isFasting).toBe(false);
    const iftarCheckpoint = schedule.checkpoints.find((c) => c.id === 'block-iftar');
    expect(iftarCheckpoint).toBeDefined();
    // 20% of 3.06 = 0.612 L (612 ml)
    expect(iftarCheckpoint?.allocatedMl).toBe(612);
  });

  it('asserts 0.742 L (displayed 0.74 L) at iftar for 70 kg Extreme + 30 min (3.71 L profile) with no clamp', () => {
    const schedule = generateRamadanSchedule(3.71, standardWindow, [], eveningTime);
    const iftarCheckpoint = schedule.checkpoints.find((c) => c.id === 'block-iftar');
    expect(iftarCheckpoint).toBeDefined();
    // 20% of 3.71 = 0.742 L (742 ml) < 750 ml, so does not clamp
    expect(iftarCheckpoint?.allocatedMl).toBe(742);
  });

  it('asserts 90 kg Extreme + 30 min (4.37 L profile) clamps iftar to 0.75 L and pushes remainder', () => {
    const schedule = generateRamadanSchedule(4.37, standardWindow, [], eveningTime);
    const iftarCheckpoint = schedule.checkpoints.find((c) => c.id === 'block-iftar');
    const eveningCheckpoint = schedule.checkpoints.find((c) => c.id === 'block-evening');

    // Uncapped 20% of 4.37 = 0.874 L (874 ml), which must clamp to 750 ml
    expect(iftarCheckpoint?.allocatedMl).toBe(750);

    // Uncapped evening is 40% (1748 ml). With 124 ml pushed from iftar -> 1872 ml
    expect(eveningCheckpoint?.allocatedMl).toBe(1872);
  });

  it('asserts that in a too-short window, total scheduled volume equals min(target, windowCap)', () => {
    // 2-hour window: 18:30 to 20:30 -> windowCap = 2h * 0.75 L = 1.5 L (1500 ml)
    const shortWindow = {
      iftarTime: '18:30',
      suhoorTime: '20:30',
    };

    const targetL = 3.1;
    const schedule = generateRamadanSchedule(targetL, shortWindow, [], eveningTime);

    expect(schedule.isWindowConstrained).toBe(true);
    expect(schedule.effectiveTargetL).toBe(1.5);
    expect(schedule.totalScheduledMl).toBe(1500);
  });

  it('shows countdown to iftar during daytime fasting', () => {
    const schedule = generateRamadanSchedule(3.1, standardWindow, [], daytimeFasting);
    expect(schedule.isFasting).toBe(true);
    expect(schedule.countdownToIftar).not.toBeNull();
    // 14:00 to 18:30 is 4 hours and 30 minutes
    expect(schedule.countdownToIftar?.hours).toBe(4);
    expect(schedule.countdownToIftar?.minutes).toBe(30);
  });

  it('property sweep: sweeps targets 1.5–4.5 L asserting scheduled volume = min(target, windowCap) and rolling cap', () => {
    const windowConfigs = [
      { iftarTime: '18:30', suhoorTime: '20:30' }, // 2 hours
      { iftarTime: '18:00', suhoorTime: '22:00' }, // 4 hours
      { iftarTime: '18:30', suhoorTime: '02:30' }, // 8 hours
      { iftarTime: '18:30', suhoorTime: '05:00' }, // 10.5 hours
    ];

    for (let target = 1.5; target <= 4.5; target += 0.25) {
      for (const win of windowConfigs) {
        const schedule = generateRamadanSchedule(target, win, [], eveningTime);

        // Assert scheduled volume matches min(target, windowCap)
        const expectedEffectiveMl = Math.round(
          Math.min(target, schedule.windowCapL) * 1000
        );
        expect(
          Math.abs(schedule.totalScheduledMl - expectedEffectiveMl)
        ).toBeLessThanOrEqual(2);

        // Assert no block rate exceeds 0.75 L per 60 mins
        for (const cp of schedule.checkpoints) {
          const maxAllowedForDuration = (cp.durationMinutes / 60) * 750 + 5; // +5 ml rounding allowance
          expect(cp.allocatedMl).toBeLessThanOrEqual(Math.ceil(maxAllowedForDuration));
        }
      }
    }
  });
});
