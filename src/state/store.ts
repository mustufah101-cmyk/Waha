import {
  WahaState,
  UserProfile,
  loadStoredState,
  saveStoredState,
} from './storage.ts';
import { calculateDailyTarget, TargetResult } from '../engine/targetCalculator.ts';

type StateListener = (state: WahaState) => void;

class Store {
  private state: WahaState;
  private listeners: Set<StateListener> = new Set();
  private injectedNow: Date | null = null;

  constructor() {
    this.state = loadStoredState();
    this.initClockOverride();
  }

  private initClockOverride(): void {
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      const nowParam = params.get('now');
      if (nowParam) {
        // format HH:mm
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

  private notify(): void {
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

  public getCalculatedTarget(): TargetResult {
    return calculateDailyTarget(
      {
        weightKg: this.state.profile.weightKg,
        outdoorTime: this.state.profile.outdoorTime,
      },
      this.state.conditions
    );
  }
}

export const store = new Store();
