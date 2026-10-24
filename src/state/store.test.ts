import { describe, it, expect, beforeEach } from 'vitest';
import { store } from './store.ts';

describe('Store Logging & Progress', () => {
  beforeEach(() => {
    // Reset state before tests
    store.completeOnboarding(70, 'mixed');
    store.setHeat('mild');
    store.setWorkoutMinutes(0);
    // Clear entries
    store.getState().todayEntries = [];
    store.lastLoggedEntry = null;
  });

  it('logs 250 ml and increments total logged', () => {
    store.logWater(250);
    expect(store.getTodayLoggedMl()).toBe(250);
    const progress = store.getProgress();
    expect(progress.loggedMl).toBe(250);
    expect(progress.targetMl).toBe(2300); // 2.3 L for 70kg Mild
    expect(progress.remainingMl).toBe(2050);
    expect(progress.percent).toBe(11);
    expect(progress.isGoalReached).toBe(false);
  });

  it('supports undoing the last logged entry', () => {
    store.logWater(250);
    store.logWater(500);
    expect(store.getTodayLoggedMl()).toBe(750);

    const undone = store.undoLastLog();
    expect(undone).toBe(true);
    expect(store.getTodayLoggedMl()).toBe(250);
  });

  it('triggers goal reached when logged exceeds target', () => {
    store.logWater(2000);
    store.logWater(500);
    expect(store.getTodayLoggedMl()).toBe(2500);
    const progress = store.getProgress();
    expect(progress.isGoalReached).toBe(true);
    expect(progress.percent).toBe(100);
    expect(progress.remainingMl).toBe(0);
  });
});
