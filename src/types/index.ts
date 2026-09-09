/**
 * Shared domain types for the Atronz app.
 *
 * These mirror the shape we expect the future Atronz API to return, so the
 * mock data layer in `src/data` can be swapped for real fetches without
 * touching any component.
 *
 * Anything the UI shows is either raw telemetry (`PetVitals`, `DeviceStatus`)
 * or *derived* from it (`HealthScore`, `PetMetrics`, `AiInsight`). Derived
 * values are never stored, so a simulated change flows through every card.
 */

export type Species = 'dog' | 'cat';

export type PetSex = 'male' | 'female';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  ageYears: number;
  ageMonths: number;
  weightKg: number;
  sex: PetSex;
  /** Remote photo. Components fall back to initials when this fails to load. */
  photoUrl?: string;
  /** Yesterday's wellness score, used for the day-over-day comparison. */
  previousHealthScore: number;
  microchipId: string;
  vetClinic: string;
  /** Archived pets keep all their data but drop out of the active list. */
  archived: boolean;
}

export type VaccinationStatus = 'up-to-date' | 'due-soon' | 'overdue';

/** Owner-entered vaccination record. Atronz never assesses these clinically. */
export interface Vaccination {
  id: string;
  petId: string;
  name: string;
  status: VaccinationStatus;
  dueLabel: string;
}

export type HealthStatus =
  | 'excellent'
  | 'good'
  | 'monitor'
  | 'attention'
  /** No readings recorded yet — a brand-new pet, not a bad score. */
  | 'pending';

export type TrendDirection = 'up' | 'down' | 'flat';

/**
 * Raw daily telemetry for one pet. Everything on the Overview page is computed
 * from this, which is what makes the demo simulations propagate everywhere.
 */
export interface PetVitals {
  steps: number;
  stepGoal: number;
  /** Yesterday's steps — the baseline the trend indicators compare against. */
  baselineSteps: number;

  restMinutes: number;
  restGoalMinutes: number;
  baselineRestMinutes: number;

  calorieTarget: number;
  /** `null` when the pet has no smart bowl paired. */
  waterMl: number | null;
  waterTargetMl: number | null;

  /**
   * Cat-only baselines. `null` on dog profiles, which is the signal the whole
   * app uses to decide that litter tracking does not apply.
   */
  litterBaselineVisits: number | null;
  litterBaselineDurationSeconds: number | null;
}

/** One dated weight reading. */
export interface WeightEntry {
  label: string;
  weightKg: number;
}

/**
 * Trailing history for the trend charts. The arrays hold the SIX days before
 * today, oldest first — today's point is appended from live `PetVitals`, so
 * the charts move whenever a simulation changes the current readings.
 */
export interface PetHistory {
  steps: number[];
  restMinutes: number[];
  /** Empty for pets without a litter box. */
  litterVisits: number[];
  /** Oldest first, excluding the current weight on the pet record. */
  weights: WeightEntry[];
}

/** A single plotted point in a trend chart. */
export interface SeriesPoint {
  label: string;
  value: number;
  isCurrent: boolean;
}

export type BaselineBand =
  | 'within'
  | 'slightly-below'
  | 'slightly-above'
  | 'outside';

export interface BaselineRow {
  id: string;
  label: string;
  current: string;
  baseline: string;
  /** True when there is not enough history to compare against yet. */
  noBaseline?: boolean;
  /** Signed percentage difference from the baseline. */
  deltaPercent: number;
  band: BaselineBand;
  trend: TrendDirection;
}

/** What the tray's sensors detected. Device output, never an interpretation. */
export type LitterUsageType = 'liquid' | 'solid' | 'mixed' | 'unknown';

export interface LitterEvent {
  id: string;
  petId: string;
  /** 24-hour "HH:MM". */
  time: string;
  durationSeconds: number;
  /** Deposit weight from the tray scale; `null` on trays without one. */
  depositGrams: number | null;
  usageType: LitterUsageType;
}

export type LitterPower = 'mains' | 'battery';

/** A paired smart litter box. Only pets with one get the Litter dashboard. */
export interface LitterDevice {
  petId: string;
  deviceName: string;
  connected: boolean;
  lastSyncMinutesAgo: number;
  powerSource: LitterPower;
  /** `null` when the tray runs from mains power. */
  batteryPercent: number | null;
  litterLevelPercent: number;
  lowLitterThreshold: number;
  lastCleanedHoursAgo: number;
  cleaningIntervalHours: number;
}

/** Totals summed from the litter events and tray, merged onto vitals. */
export interface LitterTotals {
  litterVisits: number | null;
  litterAvgDurationSeconds: number | null;
  litterLevelPercent: number | null;
}

export interface LitterSummary {
  visitsToday: number;
  lastVisitTime: string | null;
  avgDurationSeconds: number | null;
  baselineVisits: number;
  baselineDurationSeconds: number | null;
  /** Usual daily range, derived from the baseline. */
  usualRangeLow: number;
  usualRangeHigh: number;
  band: BaselineBand;
  deltaPercent: number;
  litterLevelPercent: number;
  lowLitterThreshold: number;
  isLowLitter: boolean;
  lastCleanedHoursAgo: number;
  cleaningDue: boolean;
  totalDepositGrams: number | null;
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'treat';

export type MealStatus = 'logged' | 'planned' | 'missed';

/**
 * One entry in a pet's day of food. This list is the source of truth for
 * nutrition: consumed calories and meal counts are summed from it, so logging
 * a meal moves the Nutrition, Overview and Health screens together.
 */
export interface MealEntry {
  id: string;
  petId: string;
  name: string;
  foodType: string;
  quantity: number;
  unit: string;
  /** `null` when the food has no calorie information on file. */
  calories: number | null;
  category: MealCategory;
  /** 24-hour "HH:MM". */
  time: string;
  status: MealStatus;
  isTreat: boolean;
  notes?: string;
}

/** Totals summed from the meal list, merged onto vitals for the score layer. */
export interface NutritionTotals {
  calories: number;
  mealsLogged: number;
  mealsPlanned: number;
}

/**
 * What the derivation layer actually consumes: raw vitals plus the totals
 * summed from the meal list and the litter events.
 */
export type DerivedVitals = PetVitals & NutritionTotals & LitterTotals;

export type NutritionStatus =
  | 'on-track'
  | 'slightly-below'
  | 'above'
  | 'no-data';

export interface NutritionSummary {
  targetKcal: number;
  consumedKcal: number;
  remainingKcal: number;
  percent: number;
  mealsPlanned: number;
  mealsLogged: number;
  mealsPending: number;
  mealsMissed: number;
  treatCount: number;
  treatKcal: number;
  /** True when at least one logged item has no calorie figure on file. */
  hasUnknownCalories: boolean;
  waterMl: number | null;
  waterTargetMl: number | null;
  status: NutritionStatus;
}

/** Owner-recorded food profile. Atronz never infers any of this. */
export interface FoodProfile {
  petId: string;
  preferredFood: string | null;
  allergies: string[];
  restrictions: string[];
  treatPreferences: string[];
  notes: string | null;
}

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor';

export type ActivityState =
  | 'resting'
  | 'sleeping'
  | 'walking'
  | 'playing'
  | 'eating';

/** Simulated collar telemetry. Sensor fields depend on the hardware model. */
export interface DeviceStatus {
  deviceName: string;
  collarConnected: boolean;
  batteryPercent: number;
  connectionQuality: ConnectionQuality;
  lastSeenMinutesAgo: number;
  activityState: ActivityState;
  /** Not every collar model carries the optional sensors. */
  supportsHeartRate: boolean;
  supportsTemperature: boolean;
  heartRateBpm: number | null;
  temperatureC: number | null;
}

export interface ScorePillars {
  activity: number;
  rest: number;
  nutrition: number;
  /** `null` on profiles where litter is not tracked. */
  litter: number | null;
}

export interface HealthScore {
  score: number;
  /** The goal-attainment percentages the score was averaged from. */
  pillars: ScorePillars;
  previous: number;
  delta: number;
  status: HealthStatus;
  /** Plain-language reason for the current score. Never a diagnosis. */
  summary: string;
}

export interface MetricSummary {
  id: 'activity' | 'rest' | 'nutrition' | 'litter';
  label: string;
  value: string;
  unit?: string;
  /** Short status word shown as a pill, e.g. "On track". */
  status: string;
  caption: string;
  /** Percentage of the daily goal reached, 0–100. */
  progress: number;
  trend: TrendDirection;
  trendLabel: string;
  /** Route the card navigates to, or `null` when it does not apply. */
  to: string | null;
  /** Set when the metric does not apply to this pet (e.g. litter for a dog). */
  unavailableLabel?: string;
}

export interface PetMetrics {
  activity: MetricSummary;
  rest: MetricSummary;
  nutrition: MetricSummary;
  litter: MetricSummary;
}

export type InsightTone = 'positive' | 'watch' | 'attention';

/** Optional deep link a rule can attach, e.g. "View nutrition" -> /nutrition. */
export interface InsightAction {
  label: string;
  to: string;
}

export interface AiInsight {
  id: string;
  petId: string;
  tone: InsightTone;
  headline: string;
  /** What changed, in the pet's own numbers. */
  body: string;
  /** Suggested next step. Wellness guidance, never a medical instruction. */
  recommendation: string;
  confidence: number;
  generatedAt: string;
  action?: InsightAction;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AlertCategory =
  | 'activity'
  | 'nutrition'
  | 'litter'
  | 'device'
  | 'general';

export interface PetAlert {
  id: string;
  petId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  timestamp: string;
  read: boolean;
}

export type TimelineEventType =
  | 'meal'
  | 'collar'
  | 'rest'
  | 'litter'
  | 'score'
  | 'alert';

export interface TimelineEvent {
  id: string;
  petId: string;
  type: TimelineEventType;
  title: string;
  detail: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  severity: AlertSeverity;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: string;
  memberSince: string;
  avatarUrl?: string;
}

export type QuickActionId =
  | 'log-food'
  | 'view-health'
  | 'check-litter'
  | 'add-pet'
  | 'care-history';

export interface QuickAction {
  id: QuickActionId;
  label: string;
  description: string;
}
