export interface UserProfile {
  weightKg: number;
  outdoorTime: 'indoors' | 'mixed' | 'outdoors';
  nickname?: string;
  onboardingCompleted: boolean;
}

export interface DayConditions {
  heat: 'mild' | 'hot' | 'extreme';
  workoutMinutes: number;
}

export interface WindowConfig {
  iftarTime: string;  // HH:mm
  suhoorTime: string; // HH:mm
}

export interface LogEntry {
  id: string;
  timestamp: number;
  amountMl: number;
}

export interface DayRecord {
  dateKey: string;
  profileSnapshot: UserProfile;
  conditions: DayConditions;
  unroundedTargetL: number;
  effectiveTargetL: number;
  displayTargetL: number;
  entries: LogEntry[];
  ramadanMode: boolean;
}

export interface WahaState {
  profile: UserProfile;
  conditions: DayConditions;
  windowConfig: WindowConfig;
  ramadanMode: boolean;
  todayEntries: LogEntry[];
  history: Record<string, DayRecord>;
}

const STORAGE_KEY = 'waha_state_v1';

export const DEFAULT_PROFILE: UserProfile = {
  weightKg: 70,
  outdoorTime: 'mixed',
  nickname: 'Desert Traveler',
  onboardingCompleted: false,
};

export const DEFAULT_CONDITIONS: DayConditions = {
  heat: 'mild',
  workoutMinutes: 0,
};

export const DEFAULT_WINDOW: WindowConfig = {
  iftarTime: '18:30',
  suhoorTime: '05:00',
};

export const DEFAULT_STATE: WahaState = {
  profile: DEFAULT_PROFILE,
  conditions: DEFAULT_CONDITIONS,
  windowConfig: DEFAULT_WINDOW,
  ramadanMode: false,
  todayEntries: [],
  history: {},
};

export function loadStoredState(): WahaState {
  try {
    if (typeof localStorage === 'undefined') {
      return { ...DEFAULT_STATE };
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      profile: { ...DEFAULT_PROFILE, ...(parsed.profile || {}) },
      conditions: { ...DEFAULT_CONDITIONS, ...(parsed.conditions || {}) },
      windowConfig: { ...DEFAULT_WINDOW, ...(parsed.windowConfig || {}) },
      todayEntries: Array.isArray(parsed.todayEntries) ? parsed.todayEntries : [],
      history: parsed.history && typeof parsed.history === 'object' ? parsed.history : {},
    };
  } catch (err) {
    console.warn('Waha: localStorage unavailable, using in-memory fallback', err);
    return { ...DEFAULT_STATE };
  }
}

export function saveStoredState(state: WahaState): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.warn('Waha: Failed to save to localStorage', err);
  }
}
