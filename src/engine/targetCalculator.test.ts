import { describe, it, expect } from 'vitest';
import { calculateDailyTarget } from './targetCalculator.ts';

describe('targetCalculator', () => {
  const profile70kgMixed = {
    weightKg: 70,
    outdoorTime: 'mixed' as const,
  };

  it('asserts 2.3 L display target with 2.31 L base for 70 kg Mild', () => {
    const result = calculateDailyTarget(profile70kgMixed, {
      heat: 'mild',
      workoutMinutes: 0,
    });

    expect(result.baseTargetL).toBe(2.31);
    expect(result.displayTargetL).toBe(2.3);
    expect(result.unroundedTargetL).toBe(2.31);
    expect(result.breakdownLines).toEqual(['2.31 L Base']);
    expect(result.cupsCount).toBe(9); // 2300 ml / 250
  });

  it('asserts 3.1 L display target with stacked explanations for 70 kg Hot', () => {
    const result = calculateDailyTarget(profile70kgMixed, {
      heat: 'hot',
      workoutMinutes: 0,
    });

    expect(result.baseTargetL).toBe(2.31);
    expect(result.heatAdditionL).toBe(0.50);
    expect(result.outdoorAdditionL).toBe(0.25);
    expect(result.workoutAdditionL).toBe(0);
    expect(result.unroundedTargetL).toBe(3.06);
    expect(result.displayTargetL).toBe(3.1);
    expect(result.breakdownLines).toEqual([
      '2.31 L Base',
      '+0.50 L Heat',
      '+0.25 L Outdoors',
    ]);
  });

  it('asserts 3.7 L display target for 70 kg Extreme + 30-min workout', () => {
    const result = calculateDailyTarget(profile70kgMixed, {
      heat: 'extreme',
      workoutMinutes: 30,
    });

    expect(result.baseTargetL).toBe(2.31);
    expect(result.heatAdditionL).toBe(0.80);
    expect(result.outdoorAdditionL).toBe(0.25);
    expect(result.workoutAdditionL).toBe(0.35);
    expect(result.unroundedTargetL).toBe(3.71);
    expect(result.displayTargetL).toBe(3.7);
    expect(result.breakdownLines).toEqual([
      '2.31 L Base',
      '+0.80 L Heat',
      '+0.25 L Outdoors',
      '+0.35 L Workout',
    ]);
  });

  it('clamps minimum daily target to 1.5 L', () => {
    const result = calculateDailyTarget(
      { weightKg: 35, outdoorTime: 'indoors' },
      { heat: 'mild', workoutMinutes: 0 }
    );
    expect(result.baseTargetL).toBe(1.16);
    expect(result.unroundedTargetL).toBe(1.5);
    expect(result.displayTargetL).toBe(1.5);
  });

  it('clamps maximum daily target to 4.5 L', () => {
    const result = calculateDailyTarget(
      { weightKg: 120, outdoorTime: 'outdoors' },
      { heat: 'extreme', workoutMinutes: 90 }
    );
    expect(result.unroundedTargetL).toBe(4.5);
    expect(result.displayTargetL).toBe(4.5);
  });
});
