import { ENGINE_CONFIG } from './engineConfig.ts';

export interface UserTargetProfile {
  weightKg: number;
  outdoorTime: 'indoors' | 'mixed' | 'outdoors';
}

export interface DayTargetConditions {
  heat: 'mild' | 'hot' | 'extreme';
  workoutMinutes: number;
}

export interface TargetResult {
  unroundedTargetL: number;
  displayTargetL: number;
  cupsCount: number;
  baseTargetL: number;
  heatAdditionL: number;
  outdoorAdditionL: number;
  workoutAdditionL: number;
  breakdownLines: string[];
}

export function calculateDailyTarget(
  profile: UserTargetProfile,
  conditions: DayTargetConditions
): TargetResult {
  const baseTargetL = Number((profile.weightKg * ENGINE_CONFIG.baseWeightMultiplier).toFixed(2));
  const heatAdditionL = ENGINE_CONFIG.heatAdditionsL[conditions.heat];
  
  // Outdoor addition applies on Hot and Extreme days
  const outdoorAdditionL =
    conditions.heat !== 'mild' ? ENGINE_CONFIG.outdoorAdditionsL[profile.outdoorTime] : 0;
  
  const workoutUnits = Math.max(0, Math.floor(conditions.workoutMinutes / 30));
  const workoutAdditionL = Number(
    (workoutUnits * ENGINE_CONFIG.workoutAdditionLPer30Min).toFixed(2)
  );

  const rawTotal = baseTargetL + heatAdditionL + outdoorAdditionL + workoutAdditionL;
  const unroundedTargetL = Number(
    Math.max(
      ENGINE_CONFIG.minDailyTargetL,
      Math.min(ENGINE_CONFIG.maxDailyTargetL, rawTotal)
    ).toFixed(3)
  );

  // Display target rounded to 0.1 L
  const displayTargetL = Number(unroundedTargetL.toFixed(1));
  const cupsCount = Math.round((displayTargetL * 1000) / 250);

  const breakdownLines: string[] = [
    `${baseTargetL.toFixed(2)} L Base`,
  ];

  if (heatAdditionL > 0) {
    breakdownLines.push(`+${heatAdditionL.toFixed(2)} L Heat`);
  }

  if (outdoorAdditionL > 0) {
    breakdownLines.push(`+${outdoorAdditionL.toFixed(2)} L Outdoors`);
  }

  if (workoutAdditionL > 0) {
    breakdownLines.push(`+${workoutAdditionL.toFixed(2)} L Workout`);
  }

  return {
    unroundedTargetL,
    displayTargetL,
    cupsCount,
    baseTargetL,
    heatAdditionL,
    outdoorAdditionL,
    workoutAdditionL,
    breakdownLines,
  };
}
