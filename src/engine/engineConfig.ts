export interface EngineConfig {
  baseWeightMultiplier: number; // L per kg (0.033)
  minDailyTargetL: number;      // 1.5 L
  maxDailyTargetL: number;      // 4.5 L
  hourlyCapL: number;           // 0.75 L per 60 mins
  heatAdditionsL: {
    mild: number;               // 0.0
    hot: number;                // 0.50
    extreme: number;            // 0.80
  };
  outdoorAdditionsL: {
    indoors: number;            // 0.0
    mixed: number;              // 0.25
    outdoors: number;           // 0.50
  };
  workoutAdditionLPer30Min: number; // 0.35 L per 30 minutes
  ramadanSplitRatios: {
    iftar: number;              // 0.20
    evening: number;            // 0.40
    nightSips: number;          // 0.15
    suhoor: number;             // 0.25
  };
  blockDurationRatios: {
    iftarMaxMinutes: number;    // 60
    iftarRatio: number;         // 0.125
    eveningRatio: number;       // 0.45
    nightSipsRatio: number;     // 0.25
    suhoorRatio: number;        // 0.175
  };
}

export const ENGINE_CONFIG: EngineConfig = {
  baseWeightMultiplier: 0.033,
  minDailyTargetL: 1.5,
  maxDailyTargetL: 4.5,
  hourlyCapL: 0.75,
  heatAdditionsL: {
    mild: 0.0,
    hot: 0.50,
    extreme: 0.80,
  },
  outdoorAdditionsL: {
    indoors: 0.0,
    mixed: 0.25,
    outdoors: 0.50,
  },
  workoutAdditionLPer30Min: 0.35,
  ramadanSplitRatios: {
    iftar: 0.20,
    evening: 0.40,
    nightSips: 0.15,
    suhoor: 0.25,
  },
  blockDurationRatios: {
    iftarMaxMinutes: 60,
    iftarRatio: 0.125,
    eveningRatio: 0.45,
    nightSipsRatio: 0.25,
    suhoorRatio: 0.175,
  },
};
