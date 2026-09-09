import { clamp, formatNumber } from '@/lib/utils';
import type {
  ActivityState,
  AppNotification,
  DeviceStatus,
  LitterDevice,
  LitterEvent,
  LitterUsageType,
  MealEntry,
  Pet,
  PetAlert,
  PetVitals,
  TimelineEvent,
} from '@/types';

/**
 * Demo simulations.
 *
 * These produce *simulated* telemetry so the dashboard can be explored without
 * hardware. Every surface that shows simulated data is labelled as such in the
 * UI — nothing here is presented as a real device reading.
 *
 * Both simulations only touch raw vitals/device state. Scores, metric cards,
 * trends and the AI insight are derived, so they update on their own.
 */

let sequence = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${sequence++}`;

const ACTIVITY_CYCLE: ActivityState[] = [
  'resting',
  'walking',
  'playing',
  'eating',
  'sleeping',
];

export interface LiveUpdateResult {
  vitals: PetVitals;
  device: DeviceStatus;
  event: TimelineEvent;
  message: string;
}

/**
 * A single collar sync: a small burst of movement, a fresh last-seen time and
 * slightly drained battery.
 */
export function simulateLiveUpdate(
  pet: Pet,
  vitals: PetVitals,
  device: DeviceStatus,
): LiveUpdateResult {
  const stepBurst = 120 + Math.round(Math.random() * 360);
  const restBurst = Math.random() < 0.4 ? 5 + Math.round(Math.random() * 15) : 0;

  const nextState =
    ACTIVITY_CYCLE[
      (ACTIVITY_CYCLE.indexOf(device.activityState) + 1) % ACTIVITY_CYCLE.length
    ];

  const nextVitals: PetVitals = {
    ...vitals,
    steps: vitals.steps + stepBurst,
    restMinutes: vitals.restMinutes + restBurst,
  };

  const nextDevice: DeviceStatus = {
    ...device,
    collarConnected: true,
    lastSeenMinutesAgo: 0,
    activityState: nextState,
    batteryPercent: clamp(device.batteryPercent - 1, 0, 100),
    connectionQuality: device.connectionQuality === 'poor' ? 'fair' : device.connectionQuality,
    heartRateBpm: device.supportsHeartRate
      ? clamp(
          (device.heartRateBpm ?? 80) + Math.round((Math.random() - 0.5) * 10),
          55,
          140,
        )
      : null,
    temperatureC: device.supportsTemperature
      ? Number(
          clamp(
            (device.temperatureC ?? 38.3) + (Math.random() - 0.5) * 0.4,
            37.5,
            39.2,
          ).toFixed(1),
        )
      : null,
  };

  const event: TimelineEvent = {
    id: nextId('tl'),
    petId: pet.id,
    type: 'collar',
    title: 'Live sync received (simulated)',
    detail: `+${formatNumber(stepBurst)} steps · ${pet.name} is now ${nextState}.`,
    timestamp: 'Just now',
  };

  return {
    vitals: nextVitals,
    device: nextDevice,
    event,
    message: `+${formatNumber(stepBurst)} steps synced for ${pet.name}`,
  };
}

export interface HealthChangeResult {
  vitals: PetVitals;
  /** How many planned/logged meals the context should mark as missed. */
  missedMeals: number;
  /** Extra tray visits the context should append, for pets with a litter box. */
  extraLitterVisits: number;
  alerts: PetAlert[];
  notification: AppNotification;
  events: TimelineEvent[];
  message: string;
}

/**
 * Pushes the pet's day outside its usual baseline: reduced movement, shorter
 * rest, less food, and for cats more frequent litter visits. Emits an alert and
 * a notification so the rest of the shell reacts too.
 */
export function simulateHealthChange(
  pet: Pet,
  vitals: PetVitals,
): HealthChangeResult {
  const nextVitals: PetVitals = {
    ...vitals,
    steps: Math.round(vitals.steps * 0.45),
    restMinutes: Math.round(vitals.restMinutes * 0.78),
  };

  const alerts: PetAlert[] = [
    {
      id: nextId('alert'),
      petId: pet.id,
      title: 'Activity below usual baseline',
      description: `${formatNumber(nextVitals.steps)} steps against a usual ${formatNumber(vitals.baselineSteps)}. Simulated demo event.`,
      severity: 'warning',
      category: 'activity',
      timestamp: 'Just now',
      read: false,
    },
    {
      id: nextId('alert'),
      petId: pet.id,
      title: 'Food intake lower than target',
      description: 'A planned meal was marked as missed. Simulated demo event.',
      severity: 'warning',
      category: 'nutrition',
      timestamp: 'Just now',
      read: false,
    },
  ];

  if (vitals.litterBaselineVisits !== null) {
    alerts.push({
      id: nextId('alert'),
      petId: pet.id,
      title: 'Litter box visits above baseline',
      description: 'Extra tray visits were recorded. Simulated demo event.',
      severity: 'critical',
      category: 'litter',
      timestamp: 'Just now',
      read: false,
    });
  }

  const notification: AppNotification = {
    id: nextId('note'),
    title: `${pet.name} — unusual pattern detected`,
    description: 'Simulated demo event: activity and food intake are down.',
    timestamp: 'Just now',
    read: false,
    severity: 'warning',
  };

  const events: TimelineEvent[] = [
    {
      id: nextId('tl'),
      petId: pet.id,
      type: 'alert',
      title: 'Unusual pattern flagged (simulated)',
      detail: 'Activity, rest and food intake all moved outside the baseline.',
      timestamp: 'Just now',
    },
    {
      id: nextId('tl'),
      petId: pet.id,
      type: 'score',
      title: 'Health score updated',
      detail: 'Wellness score recalculated from the new readings.',
      timestamp: 'Just now',
    },
  ];

  return {
    vitals: nextVitals,
    missedMeals: 1,
    extraLitterVisits: 3,
    alerts,
    notification,
    events,
    message: `Unusual pattern simulated for ${pet.name}`,
  };
}


export interface MissedMealResult {
  alert: PetAlert;
  notification: AppNotification;
  event: TimelineEvent;
  message: string;
}

/**
 * Nutrition-screen simulation: one planned meal is marked as missed. The
 * calorie total, completion percentage, status and insight all follow from the
 * meal list, so nothing else needs to be touched here.
 */
export function simulateMissedMeal(
  pet: Pet,
  meal: MealEntry,
): MissedMealResult {
  return {
    alert: {
      id: nextId('alert'),
      petId: pet.id,
      title: 'Planned meal missed',
      description: `${meal.name} at ${meal.time} was not served. Simulated demo event.`,
      severity: 'warning',
      category: 'nutrition',
      timestamp: 'Just now',
      read: false,
    },
    notification: {
      id: nextId('note'),
      title: `${pet.name} — planned meal missed`,
      description: `Simulated demo event: ${meal.name} was not served.`,
      timestamp: 'Just now',
      read: false,
      severity: 'warning',
    },
    event: {
      id: nextId('tl'),
      petId: pet.id,
      type: 'meal',
      title: 'Planned meal missed (simulated)',
      detail: `${meal.name} at ${meal.time} was not served.`,
      timestamp: 'Just now',
    },
    message: `Missed meal simulated for ${pet.name}`,
  };
}

/** Timeline entry for a meal the owner logged or marked as served. */
export function mealTimelineEvent(
  pet: Pet,
  meal: MealEntry,
  kind: 'logged' | 'completed',
): TimelineEvent {
  const calories =
    meal.calories === null ? 'no calorie data' : `${formatNumber(meal.calories)} kcal`;
  return {
    id: nextId('tl'),
    petId: pet.id,
    type: 'meal',
    title: kind === 'logged' ? 'Meal logged' : 'Planned meal served',
    detail: `${meal.name} · ${meal.quantity} ${meal.unit} · ${calories}.`,
    timestamp: 'Just now',
  };
}

export interface LitterUsageResult {
  event: LitterEvent;
  timelineEvent: TimelineEvent;
  message: string;
}

const USAGE_CYCLE: LitterUsageType[] = ['liquid', 'solid', 'liquid', 'unknown'];

/** One simulated tray visit, appended to the pet's event list. */
export function simulateLitterUsage(
  pet: Pet,
  existingCount: number,
): LitterUsageResult {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const durationSeconds = 60 + Math.round(Math.random() * 90);
  const usageType = USAGE_CYCLE[existingCount % USAGE_CYCLE.length];

  const event: LitterEvent = {
    id: nextId('litter'),
    petId: pet.id,
    time,
    durationSeconds,
    depositGrams: 12 + Math.round(Math.random() * 30),
    usageType,
  };

  return {
    event,
    timelineEvent: {
      id: nextId('tl'),
      petId: pet.id,
      type: 'litter',
      title: 'Litter box visit recorded (simulated)',
      detail: `Visit ${existingCount + 1} of the day at ${time} · ${durationSeconds}s.`,
      timestamp: 'Just now',
    },
    message: `Tray visit recorded for ${pet.name}`,
  };
}

export interface LowLitterResult {
  device: LitterDevice;
  alert: PetAlert;
  notification: AppNotification;
  timelineEvent: TimelineEvent;
  message: string;
}

/** Drops the tray level below its low-litter threshold. */
export function simulateLowLitter(
  pet: Pet,
  device: LitterDevice,
): LowLitterResult {
  const nextLevel = clamp(
    Math.min(device.litterLevelPercent, device.lowLitterThreshold) - 8,
    0,
    100,
  );
  const nextDevice: LitterDevice = {
    ...device,
    litterLevelPercent: nextLevel,
    lastSyncMinutesAgo: 0,
  };

  return {
    device: nextDevice,
    alert: {
      id: nextId('alert'),
      petId: pet.id,
      title: 'Litter level is low',
      description: `The tray is at ${nextLevel}%, below the ${device.lowLitterThreshold}% threshold. Simulated demo event.`,
      severity: 'warning',
      category: 'litter',
      timestamp: 'Just now',
      read: false,
    },
    notification: {
      id: nextId('note'),
      title: `${pet.name} — litter level low`,
      description: `Simulated demo event: the tray is at ${nextLevel}%.`,
      timestamp: 'Just now',
      read: false,
      severity: 'warning',
    },
    timelineEvent: {
      id: nextId('tl'),
      petId: pet.id,
      type: 'litter',
      title: 'Low litter detected (simulated)',
      detail: `Tray level dropped to ${nextLevel}%.`,
      timestamp: 'Just now',
    },
    message: `Low litter simulated for ${pet.name}`,
  };
}

export interface CleanedResult {
  device: LitterDevice;
  timelineEvent: TimelineEvent;
  message: string;
}

/** Marks the tray as freshly cleaned and topped up. */
export function markTrayCleaned(pet: Pet, device: LitterDevice): CleanedResult {
  return {
    device: {
      ...device,
      litterLevelPercent: 100,
      lastCleanedHoursAgo: 0,
      lastSyncMinutesAgo: 0,
    },
    timelineEvent: {
      id: nextId('tl'),
      petId: pet.id,
      type: 'litter',
      title: 'Tray cleaned',
      detail: 'Litter topped up to 100% and the tray marked as cleaned.',
      timestamp: 'Just now',
    },
    message: `Tray marked as cleaned for ${pet.name}`,
  };
}
