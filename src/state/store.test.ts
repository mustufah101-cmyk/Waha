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
    // Clear history
    store.getState().history = {};
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

describe('Store Streak & History', () => {
  beforeEach(() => {
    store.completeOnboarding(70, 'mixed');
    store.setHeat('mild');
    store.setWorkoutMinutes(0);
    store.getState().todayEntries = [];
    store.lastLoggedEntry = null;
    store.getState().history = {};
  });

  it('returns 0 streak when no history and today not achieved', () => {
    expect(store.getDerivedStreak()).toBe(0);
  });

  it('returns 1 streak when today achieves 90% target', () => {
    // 2.31 L target, 90% = 2079 ml
    store.logWater(2100);
    expect(store.getDerivedStreak()).toBe(1);
  });

  it('streak is 0 when today not achieved, regardless of past days', () => {
    // Get the actual current date key and calculate yesterday
    const todayKey = store.getActiveDateKey();
    const [y, m, d] = todayKey.split('-').map(Number);
    const today = new Date(y, m - 1, d);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const pastKey = `${yesterday.getFullYear()}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getDate().toString().padStart(2, '0')}`;

    // Set up a past day that achieved target
    store.getState().history[pastKey] = {
      dateKey: pastKey,
      profileSnapshot: { weightKg: 70, outdoorTime: 'mixed', onboardingCompleted: true },
      conditions: { heat: 'mild', workoutMinutes: 0 },
      unroundedTargetL: 2.31,
      effectiveTargetL: 2.3,
      displayTargetL: 2.3,
      entries: [{ id: '1', timestamp: Date.now(), amountMl: 2100 }],
      ramadanMode: false,
    };

    // Today not achieved yet -> streak is 0
    expect(store.getDerivedStreak()).toBe(0);

    // Achieve today -> streak becomes 2 (today + yesterday)
    store.logWater(2100);
    expect(store.getDerivedStreak()).toBe(2);
  });

  it('streak breaks when history day missed (no entry)', () => {
    // Get the actual current date key and calculate yesterday
    const todayKey = store.getActiveDateKey();
    const [y, m, d] = todayKey.split('-').map(Number);
    const today = new Date(y, m - 1, d);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const pastKey = `${yesterday.getFullYear()}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getDate().toString().padStart(2, '0')}`;

    // Past day with no record should break streak
    store.getState().history[pastKey] = {
      dateKey: pastKey,
      profileSnapshot: { weightKg: 70, outdoorTime: 'mixed', onboardingCompleted: true },
      conditions: { heat: 'mild', workoutMinutes: 0 },
      unroundedTargetL: 2.31,
      effectiveTargetL: 2.3,
      displayTargetL: 2.3,
      entries: [],
      ramadanMode: false,
    };

    store.logWater(2100); // Today achieved
    // But past day missed (empty entries) breaks streak
    expect(store.getDerivedStreak()).toBe(1); // Only today counts
  });

  it('getHistoryStrip returns 7 items with correct structure', () => {
    const strip = store.getHistoryStrip();
    expect(strip).toHaveLength(7);
    expect(strip[6].isToday).toBe(true);
    expect(strip[0].isToday).toBe(false);
    expect(typeof strip[0].dayLabel).toBe('string');
    expect(typeof strip[0].isAchieved).toBe('boolean');
  });
});
