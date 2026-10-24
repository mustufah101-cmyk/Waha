import { ENGINE_CONFIG } from './engineConfig.ts';
import { LogEntry, WindowConfig } from '../state/storage.ts';

export interface Checkpoint {
  id: string;
  label: string;
  timeString: string;
  startMinutes: number; // minutes from iftar
  durationMinutes: number;
  allocatedMl: number;
  consumedMl: number;
  isCurrent: boolean;
  isPast: boolean;
}

export interface RamadanSchedule {
  isFasting: boolean;
  countdownToIftar: {
    hours: number;
    minutes: number;
    seconds: number;
  } | null;
  totalWindowMinutes: number;
  windowCapL: number;
  effectiveTargetL: number;
  isWindowConstrained: boolean;
  checkpoints: Checkpoint[];
  totalScheduledMl: number;
}

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function generateRamadanSchedule(
  unroundedTargetL: number,
  windowConfig: WindowConfig,
  loggedEntries: LogEntry[],
  now: Date
): RamadanSchedule {
  const iftarMin = parseTimeToMinutes(windowConfig.iftarTime);
  const suhoorMin = parseTimeToMinutes(windowConfig.suhoorTime);

  // Total window duration in minutes (iftar to suhoor)
  const totalWindowMinutes =
    suhoorMin <= iftarMin
      ? 1440 - iftarMin + suhoorMin
      : suhoorMin - iftarMin;

  const windowHours = totalWindowMinutes / 60;
  const maxCapacityMl = Math.round(windowHours * ENGINE_CONFIG.hourlyCapL * 1000);
  const targetMl = Math.round(unroundedTargetL * 1000);
  const scheduledTotalMl = Math.min(targetMl, maxCapacityMl);

  const windowCapL = Number((maxCapacityMl / 1000).toFixed(3));
  const effectiveTargetL = Number((scheduledTotalMl / 1000).toFixed(3));
  const isWindowConstrained = targetMl > maxCapacityMl;

  // Determine current time in minutes from midnight
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Check if current time is inside the fasting window (suhoor to iftar)
  let isFasting = false;
  let minutesToIftar = 0;

  if (suhoorMin <= iftarMin) {
    if (currentMinutes >= suhoorMin && currentMinutes < iftarMin) {
      isFasting = true;
      minutesToIftar = iftarMin - currentMinutes;
    }
  } else {
    if (currentMinutes >= suhoorMin || currentMinutes < iftarMin) {
      isFasting = true;
      minutesToIftar =
        currentMinutes >= suhoorMin
          ? 1440 - currentMinutes + iftarMin
          : iftarMin - currentMinutes;
    }
  }

  const countdownToIftar = isFasting
    ? {
        hours: Math.floor(minutesToIftar / 60),
        minutes: minutesToIftar % 60,
        seconds: 60 - now.getSeconds(),
      }
    : null;

  // Block durations
  const ratios = ENGINE_CONFIG.blockDurationRatios;
  const iftarDuration = Math.min(
    ratios.iftarMaxMinutes,
    Math.round(totalWindowMinutes * ratios.iftarRatio)
  );
  const eveningDuration = Math.round(totalWindowMinutes * ratios.eveningRatio);
  const nightDuration = Math.round(totalWindowMinutes * ratios.nightSipsRatio);
  const suhoorDuration = Math.max(
    1,
    totalWindowMinutes - (iftarDuration + eveningDuration + nightDuration)
  );

  const blockDurations = [iftarDuration, eveningDuration, nightDuration, suhoorDuration];
  const blockCapacitiesMl = [
    Math.round((blockDurations[0] / 60) * ENGINE_CONFIG.hourlyCapL * 1000),
    Math.round((blockDurations[1] / 60) * ENGINE_CONFIG.hourlyCapL * 1000),
    Math.round((blockDurations[2] / 60) * ENGINE_CONFIG.hourlyCapL * 1000),
    0,
  ];
  blockCapacitiesMl[3] = Math.max(
    0,
    maxCapacityMl - (blockCapacitiesMl[0] + blockCapacitiesMl[1] + blockCapacitiesMl[2])
  );

  // Initial target allocations based on 20% / 40% / 15% / 25%
  const splits = ENGINE_CONFIG.ramadanSplitRatios;
  const rawSharesMl = [
    Math.round(scheduledTotalMl * splits.iftar),
    Math.round(scheduledTotalMl * splits.evening),
    Math.round(scheduledTotalMl * splits.nightSips),
    0, // last block takes the balance
  ];
  rawSharesMl[3] = Math.max(0, scheduledTotalMl - (rawSharesMl[0] + rawSharesMl[1] + rawSharesMl[2]));

  // Cap enforcement & forward redistribution across blocks
  const finalAllocationsMl = [0, 0, 0, 0];
  let carryOverMl = 0;

  for (let i = 0; i < 4; i++) {
    const desired = rawSharesMl[i] + carryOverMl;
    const cap = blockCapacitiesMl[i];
    if (desired > cap) {
      finalAllocationsMl[i] = cap;
      carryOverMl = desired - cap;
    } else {
      finalAllocationsMl[i] = desired;
      carryOverMl = 0;
    }
  }

  // If there's any remaining carryOver (e.g. in small rounding edge cases), place in blocks with headroom
  if (carryOverMl > 0) {
    for (let i = 0; i < 4 && carryOverMl > 0; i++) {
      const room = blockCapacitiesMl[i] - finalAllocationsMl[i];
      if (room > 0) {
        const add = Math.min(room, carryOverMl);
        finalAllocationsMl[i] += add;
        carryOverMl -= add;
      }
    }
  }

  const blockLabels = [
    'Iftar Break Fast',
    'Post-Meal Evening',
    'Night Hydration',
    'Pre-Dawn Suhoor',
  ];
  const blockIds = ['block-iftar', 'block-evening', 'block-night', 'block-suhoor'];
  const blockStartMins = [
    0,
    iftarDuration,
    iftarDuration + eveningDuration,
    iftarDuration + eveningDuration + nightDuration,
  ];

  let minutesSinceIftar = 0;
  if (!isFasting) {
    if (currentMinutes >= iftarMin) {
      minutesSinceIftar = currentMinutes - iftarMin;
    } else {
      minutesSinceIftar = 1440 - iftarMin + currentMinutes;
    }
  }

  let unallocatedConsumedMl = loggedEntries.reduce((sum, e) => sum + e.amountMl, 0);

  const checkpoints: Checkpoint[] = blockIds.map((id, idx) => {
    const allocatedMl = finalAllocationsMl[idx];
    const consumedMl = Math.min(allocatedMl, unallocatedConsumedMl);
    unallocatedConsumedMl = Math.max(0, unallocatedConsumedMl - consumedMl);

    const dur = blockDurations[idx];
    const startMin = blockStartMins[idx];
    const isPast = !isFasting && minutesSinceIftar >= startMin + dur;
    const isCurrent =
      !isFasting && minutesSinceIftar >= startMin && minutesSinceIftar < startMin + dur;

    return {
      id,
      label: blockLabels[idx],
      timeString: formatMinutesToTime(iftarMin + startMin),
      startMinutes: startMin,
      durationMinutes: dur,
      allocatedMl,
      consumedMl,
      isCurrent,
      isPast,
    };
  });

  const totalScheduledMl = checkpoints.reduce((sum, c) => sum + c.allocatedMl, 0);

  return {
    isFasting,
    countdownToIftar,
    totalWindowMinutes,
    windowCapL,
    effectiveTargetL,
    isWindowConstrained,
    checkpoints,
    totalScheduledMl,
  };
}
