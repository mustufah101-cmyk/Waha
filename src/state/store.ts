import {
  WahaState,
  UserProfile,
  LogEntry,
  loadStoredState,
  saveStoredState,
  DEFAULT_STATE,
} from './storage.ts';
import { calculateDailyTarget, TargetResult } from '../engine/targetCalculator.ts';
import { getHydrationDateKey, getPast7DateKeys } from '../engine/dateKey.ts';

type StateListener = (state: WahaState) => void;

class Store {
  private state: WahaState;
  private listeners: Set<StateListener> = new Set();
  private injectedNow: Date | null = null;
  public lastLoggedEntry: LogEntry | null = null;
  public undoTimeoutId: any = null;
  public isAboutOpen: boolean = false;

  constructor() {
    this.state = loadStoredState();
    this.initClockOverride();
    this.syncActiveDayRecord();
  }

  private initClockOverride(): void {
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      const nowParam = params.get('now');
      if (nowParam) {
        const [hours, minutes] = nowParam.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const d = new Date();
          d.setHours(hours, minutes, 0, 0);
          this.injectedNow = d;
          console.info(`[Waha Demo Clock] Time overridden to ${nowParam}`);
        }
      }
    }
  }

  public getNow(): Date {
    return this.injectedNow ? new Date(this.injectedNow.getTime()) : new Date();
  }

  public getActiveDateKey(): string {
    return getHydrationDateKey(this.getNow().getTime(), this.state.windowConfig.iftarTime);
  }

  public getState(): WahaState {
    return this.state;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public notify(): void {
    this.syncActiveDayRecord();
    saveStoredState(this.state);
    this.listeners.forEach((listener) => listener(this.state));
  }

  private syncActiveDayRecord(): void {
    const key = this.getActiveDateKey();
    const target = this.getCalculatedTarget();
    const totalLogged = this.getTodayLoggedMl();
    totalLogged >= target.unroundedTargetL * 1000 * 0.90; // streak threshold check

    this.state.history[key] = {
      dateKey: key,
      profileSnapshot: { ...this.state.profile },
      conditions: { ...this.state.conditions },
      unroundedTargetL: target.unroundedTargetL,
      effectiveTargetL: target.displayTargetL,
      displayTargetL: target.displayTargetL,
      entries: [...this.state.todayEntries],
      ramadanMode: this.state.ramadanMode,
    };
  }

  public setProfile(profile: Partial<UserProfile>): void {
    this.state.profile = {
      ...this.state.profile,
      ...profile,
    };
    this.notify();
  }

  public completeOnboarding(weightKg: number, outdoorTime: 'indoors' | 'mixed' | 'outdoors'): void {
    this.state.profile = {
      ...this.state.profile,
      weightKg,
      outdoorTime,
      onboardingCompleted: true,
    };
    this.notify();
  }

  public setHeat(heat: 'mild' | 'hot' | 'extreme'): void {
    this.state.conditions.heat = heat;
    this.notify();
  }

  public setWorkoutMinutes(workoutMinutes: number): void {
    this.state.conditions.workoutMinutes = workoutMinutes;
    this.notify();
  }

  public toggleRamadanMode(): void {
    this.state.ramadanMode = !this.state.ramadanMode;
    this.notify();
  }

  public openAbout(): void {
    this.isAboutOpen = true;
    this.notify();
  }

  public closeAbout(): void {
    this.isAboutOpen = false;
    this.notify();
  }

  public resetLocalData(): void {
    this.state = {
      ...DEFAULT_STATE,
      profile: { ...DEFAULT_STATE.profile, onboardingCompleted: false },
    };
    this.lastLoggedEntry = null;
    this.isAboutOpen = false;
    this.notify();
  }

  public logWater(amountMl: number): LogEntry {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: this.getNow().getTime(),
      amountMl,
    };

    this.state.todayEntries.push(entry);
    this.lastLoggedEntry = entry;

    if (this.undoTimeoutId) {
      clearTimeout(this.undoTimeoutId);
    }
    this.undoTimeoutId = setTimeout(() => {
      this.lastLoggedEntry = null;
      this.notify();
    }, 5000);

    this.notify();
    return entry;
  }

  public undoLastLog(): boolean {
    if (!this.lastLoggedEntry) {
      return false;
    }

    const index = this.state.todayEntries.findIndex(
      (e) => e.id === this.lastLoggedEntry?.id
    );

    if (index !== -1) {
      this.state.todayEntries.splice(index, 1);
      this.lastLoggedEntry = null;
      if (this.undoTimeoutId) {
        clearTimeout(this.undoTimeoutId);
        this.undoTimeoutId = null;
      }
      this.notify();
      return true;
    }

    return false;
  }

  public getTodayLoggedMl(): number {
    return this.state.todayEntries.reduce((sum, e) => sum + e.amountMl, 0);
  }

  public getCalculatedTarget(): TargetResult {
    return calculateDailyTarget(
      {
        weightKg: this.state.profile.weightKg,
        outdoorTime: this.state.profile.outdoorTime,
      },
      this.state.conditions
    );
  }

  public getProgress(): {
    loggedMl: number;
    targetMl: number;
    remainingMl: number;
    percent: number;
    isGoalReached: boolean;
  } {
    const target = this.getCalculatedTarget();
    const targetMl = Math.round(target.displayTargetL * 1000);
    const loggedMl = this.getTodayLoggedMl();
    const remainingMl = Math.max(0, targetMl - loggedMl);
    const percent = Math.min(100, Math.round((loggedMl / targetMl) * 100)) || 0;
    const isGoalReached = loggedMl >= targetMl;

    return {
      loggedMl,
      targetMl,
      remainingMl,
      percent,
      isGoalReached,
    };
  }

  public getDerivedStreak(): number {
    const currentKey = this.getActiveDateKey();
    const [y, m, d] = currentKey.split('-').map(Number);
    const baseDate = new Date(y, m - 1, d);

    let streak = 0;

    // Check if today is achieved (>= 90% of target)
    const todayTarget = this.getCalculatedTarget();
    const todayLogged = this.getTodayLoggedMl();
    const todayAchieved = todayLogged >= todayTarget.unroundedTargetL * 1000 * 0.90;
    if (!todayAchieved) {
      // Streak is broken if today is not achieved
      return 0;
    }

    // Today is achieved, start streak at 1
    streak = 1;

    // Check consecutive days prior to today
    let checkDate = new Date(baseDate);
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const checkKey = `${checkDate.getFullYear()}-${(checkDate.getMonth() + 1).toString().padStart(2, '0')}-${checkDate.getDate().toString().padStart(2, '0')}`;
      const record = this.state.history[checkKey];

      if (!record) {
        // Missing record breaks the streak
        break;
      }

      const recordLogged = record.entries.reduce((s, e) => s + e.amountMl, 0);
      const isRecordHit = recordLogged >= record.unroundedTargetL * 1000 * 0.90;

      if (isRecordHit) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  }

  public getHistoryStrip(): Array<{
    dateKey: string;
    dayLabel: string;
    isAchieved: boolean;
    isToday: boolean;
  }> {
    const currentKey = this.getActiveDateKey();
    const past7Keys = getPast7DateKeys(currentKey);

    const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return past7Keys.map((key) => {
      const [y, m, d] = key.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const label = dayLabels[dateObj.getDay()];

      const isToday = key === currentKey;
      let isAchieved = false;

      if (isToday) {
        const todayTarget = this.getCalculatedTarget();
        isAchieved = this.getTodayLoggedMl() >= todayTarget.unroundedTargetL * 1000 * 0.90;
      } else {
        const record = this.state.history[key];
        if (record) {
          const totalLogged = record.entries.reduce((s, e) => s + e.amountMl, 0);
          isAchieved = totalLogged >= record.unroundedTargetL * 1000 * 0.90;
        }
      }

      return {
        dateKey: key,
        dayLabel: label,
        isAchieved,
        isToday,
      };
    });
  }
}

export const store = new Store();
