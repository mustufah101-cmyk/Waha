import {
  WahaState,
  UserProfile,
  LogEntry,
  loadStoredState,
  saveStoredState,
} from './storage.ts';
import { calculateDailyTarget, TargetResult } from '../engine/targetCalculator.ts';

type StateListener = (state: WahaState) => void;

class Store {
  private state: WahaState;
  private listeners: Set<StateListener> = new Set();
  private injectedNow: Date | null = null;
  public lastLoggedEntry: LogEntry | null = null;
  public undoTimeoutId: any = null;

  constructor() {
    this.state = loadStoredState();
    this.initClockOverride();
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

  public getState(): WahaState {
    return this.state;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public notify(): void {
    saveStoredState(this.state);
    this.listeners.forEach((listener) => listener(this.state));
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
}

export const store = new Store();
