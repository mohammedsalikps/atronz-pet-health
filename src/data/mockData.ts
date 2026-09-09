import type {
  AppNotification,
  DeviceStatus,
  FoodProfile,
  LitterDevice,
  LitterEvent,
  MealEntry,
  Pet,
  Vaccination,
  PetAlert,
  PetHistory,
  PetVitals,
  TimelineEvent,
  UserProfile,
} from '@/types';

/**
 * Mock data stands in for the Atronz API until the backend exists.
 * Nothing outside `src/lib/api.ts` should import this file directly, so the
 * swap to real network calls stays a one-file change.
 *
 * Only raw telemetry lives here. Scores, metric cards, insights and trends are
 * all derived in `src/lib` from these numbers.
 */

export const MOCK_PETS: Pet[] = [
  {
    id: 'pet-buddy',
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    ageYears: 4,
    ageMonths: 3,
    weightKg: 31.2,
    sex: 'male',
    photoUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=480&q=80',
    previousHealthScore: 91,
    microchipId: 'ATZ-9931-0442',
    vetClinic: 'Northside Veterinary Clinic',
    archived: false,
  },
  {
    id: 'pet-luna',
    name: 'Luna',
    species: 'dog',
    breed: 'Labrador',
    ageYears: 2,
    ageMonths: 7,
    weightKg: 26.8,
    sex: 'female',
    photoUrl:
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=480&q=80',
    previousHealthScore: 82,
    microchipId: 'ATZ-4417-8820',
    vetClinic: 'Riverbend Animal Hospital',
    archived: false,
  },
  {
    id: 'pet-whiskers',
    name: 'Whiskers',
    species: 'cat',
    breed: 'Domestic Shorthair',
    ageYears: 6,
    ageMonths: 1,
    weightKg: 5.4,
    sex: 'female',
    photoUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=480&q=80',
    previousHealthScore: 68,
    microchipId: 'ATZ-2205-7713',
    vetClinic: 'Willow Lane Cat Care',
    archived: false,
  },
];

export const MOCK_VITALS: Record<string, PetVitals> = {
  'pet-buddy': {
    steps: 8420,
    stepGoal: 9000,
    baselineSteps: 7510,
    restMinutes: 680,
    restGoalMinutes: 720,
    baselineRestMinutes: 675,
    calorieTarget: 1200,
    waterMl: 900,
    waterTargetMl: 1000,
    litterBaselineVisits: null,
    litterBaselineDurationSeconds: null,
  },
  'pet-luna': {
    steps: 6140,
    stepGoal: 8000,
    baselineSteps: 6750,
    restMinutes: 585,
    restGoalMinutes: 720,
    baselineRestMinutes: 640,
    calorieTarget: 1150,
    waterMl: 620,
    waterTargetMl: 900,
    litterBaselineVisits: null,
    litterBaselineDurationSeconds: null,
  },
  'pet-whiskers': {
    steps: 2310,
    stepGoal: 4500,
    baselineSteps: 2820,
    restMinutes: 850,
    restGoalMinutes: 840,
    baselineRestMinutes: 790,
    calorieTarget: 320,
    // No smart bowl paired for Whiskers, so water is not tracked.
    waterMl: null,
    waterTargetMl: null,
    litterBaselineVisits: 3,
    litterBaselineDurationSeconds: 105,
  },
};

/**
 * Trailing six days for each pet, oldest first. Today's point is appended from
 * live vitals at render time, which is what makes the charts react to the demo
 * simulations.
 */
export const MOCK_HISTORY: Record<string, PetHistory> = {
  'pet-buddy': {
    steps: [7100, 8250, 6900, 7800, 8600, 7510],
    restMinutes: [650, 700, 620, 690, 710, 675],
    litterVisits: [],
    weights: [
      { label: '6 wks ago', weightKg: 30.4 },
      { label: '4 wks ago', weightKg: 30.9 },
      { label: '2 wks ago', weightKg: 31.0 },
      { label: 'Last week', weightKg: 31.4 },
    ],
  },
  'pet-luna': {
    steps: [7200, 6900, 7400, 7050, 6600, 6750],
    restMinutes: [700, 660, 645, 690, 615, 640],
    litterVisits: [],
    // Luna joined the account recently, so there is no weight history yet.
    weights: [],
  },
  'pet-whiskers': {
    steps: [3100, 2950, 3200, 2700, 2900, 2820],
    restMinutes: [800, 830, 770, 815, 780, 790],
    litterVisits: [3, 4, 3, 2, 3, 3],
    weights: [
      { label: '6 wks ago', weightKg: 5.6 },
      { label: '4 wks ago', weightKg: 5.55 },
      { label: '2 wks ago', weightKg: 5.5 },
      { label: 'Last week', weightKg: 5.45 },
    ],
  },
};

/**
 * Today's food for each pet. Consumed calories and meal counts are summed from
 * this list, never stored separately — see `src/lib/nutrition.ts`.
 */
export const MOCK_MEALS: MealEntry[] = [
  {
    id: 'meal-b1',
    petId: 'pet-buddy',
    name: 'Morning kibble',
    foodType: 'Dry food',
    quantity: 310,
    unit: 'g',
    calories: 590,
    category: 'breakfast',
    time: '07:30',
    status: 'logged',
    isTreat: false,
  },
  {
    id: 'meal-b2',
    petId: 'pet-buddy',
    name: 'Dental chew',
    foodType: 'Treat',
    quantity: 1,
    unit: 'piece',
    // No calorie information on file for this product.
    calories: null,
    category: 'treat',
    time: '15:00',
    status: 'logged',
    isTreat: true,
  },
  {
    id: 'meal-b3',
    petId: 'pet-buddy',
    name: 'Evening kibble',
    foodType: 'Dry food',
    quantity: 320,
    unit: 'g',
    calories: 590,
    category: 'dinner',
    time: '18:15',
    status: 'logged',
    isTreat: false,
    notes: 'Fed after the afternoon walk.',
  },
  {
    id: 'meal-l1',
    petId: 'pet-luna',
    name: 'Morning kibble',
    foodType: 'Dry food',
    quantity: 280,
    unit: 'g',
    calories: 960,
    category: 'breakfast',
    time: '08:00',
    status: 'logged',
    isTreat: false,
  },
  {
    id: 'meal-l2',
    petId: 'pet-luna',
    name: 'Evening kibble',
    foodType: 'Dry food',
    quantity: 60,
    unit: 'g',
    calories: 190,
    category: 'dinner',
    time: '18:30',
    status: 'planned',
    isTreat: false,
  },
  {
    id: 'meal-w1',
    petId: 'pet-whiskers',
    name: 'Wet food pouch',
    foodType: 'Wet food',
    quantity: 45,
    unit: 'g',
    calories: 90,
    category: 'breakfast',
    time: '07:00',
    status: 'logged',
    isTreat: false,
  },
  {
    id: 'meal-w2',
    petId: 'pet-whiskers',
    name: 'Wet food pouch',
    foodType: 'Wet food',
    quantity: 45,
    unit: 'g',
    calories: 90,
    category: 'lunch',
    time: '12:30',
    status: 'logged',
    isTreat: false,
  },
  {
    id: 'meal-w3',
    petId: 'pet-whiskers',
    name: 'Salmon treats',
    foodType: 'Treat',
    quantity: 3,
    unit: 'pieces',
    calories: 60,
    category: 'treat',
    time: '14:00',
    status: 'logged',
    isTreat: true,
  },
  {
    id: 'meal-w4',
    petId: 'pet-whiskers',
    name: 'Wet food pouch',
    foodType: 'Wet food',
    quantity: 45,
    unit: 'g',
    calories: 90,
    category: 'dinner',
    time: '18:00',
    status: 'planned',
    isTreat: false,
  },
];

/**
 * Owner-recorded food profiles. Nothing here is inferred or assessed by
 * Atronz — it is exactly what the owner typed in.
 */
export const MOCK_FOOD_PROFILES: FoodProfile[] = [
  {
    petId: 'pet-buddy',
    preferredFood: 'Atronz Adult Dry — Chicken & Rice',
    allergies: [],
    restrictions: ['No table scraps'],
    treatPreferences: ['Dental chews', 'Carrot pieces'],
    notes: 'Eats faster when fed after a walk.',
  },
  {
    // Luna was added recently and has no food profile on file yet.
    petId: 'pet-luna',
    preferredFood: null,
    allergies: [],
    restrictions: [],
    treatPreferences: [],
    notes: null,
  },
  {
    petId: 'pet-whiskers',
    preferredFood: 'Atronz Feline Wet — Salmon',
    allergies: ['Beef (noted by owner)'],
    restrictions: ['Grain-free food only'],
    treatPreferences: ['Salmon treats'],
    notes: 'Prefers small portions spread across the day.',
  },
];

/**
 * Paired smart litter boxes. Only pets that appear here get the Litter
 * dashboard — Buddy and Luna are dogs with no tray, so they are absent.
 */
/** Owner-entered vaccination records. Atronz stores, never assesses, these. */
export const MOCK_VACCINATIONS: Vaccination[] = [
  {
    id: 'vac-b1',
    petId: 'pet-buddy',
    name: 'Rabies',
    status: 'up-to-date',
    dueLabel: 'Next due in 7 months',
  },
  {
    id: 'vac-b2',
    petId: 'pet-buddy',
    name: 'DHPP booster',
    status: 'up-to-date',
    dueLabel: 'Next due in 4 months',
  },
  {
    id: 'vac-l1',
    petId: 'pet-luna',
    name: 'Annual booster',
    status: 'due-soon',
    dueLabel: 'Due in 12 days',
  },
  {
    id: 'vac-w1',
    petId: 'pet-whiskers',
    name: 'FVRCP',
    status: 'up-to-date',
    dueLabel: 'Next due in 9 months',
  },
  {
    id: 'vac-w2',
    petId: 'pet-whiskers',
    name: 'Rabies',
    status: 'overdue',
    dueLabel: 'Overdue by 3 weeks',
  },
];

export const MOCK_LITTER_DEVICES: LitterDevice[] = [
  {
    petId: 'pet-whiskers',
    deviceName: 'Atronz Smart Tray',
    connected: true,
    lastSyncMinutesAgo: 25,
    powerSource: 'mains',
    batteryPercent: null,
    litterLevelPercent: 22,
    lowLitterThreshold: 25,
    lastCleanedHoursAgo: 31,
    cleaningIntervalHours: 24,
  },
];

/** Today's tray visits. Visit counts and averages are summed from this list. */
export const MOCK_LITTER_EVENTS: LitterEvent[] = [
  {
    id: 'litter-w1',
    petId: 'pet-whiskers',
    time: '06:40',
    durationSeconds: 110,
    depositGrams: 28,
    usageType: 'liquid',
  },
  {
    id: 'litter-w2',
    petId: 'pet-whiskers',
    time: '09:15',
    durationSeconds: 95,
    depositGrams: 22,
    usageType: 'liquid',
  },
  {
    id: 'litter-w3',
    petId: 'pet-whiskers',
    time: '12:50',
    durationSeconds: 140,
    depositGrams: 45,
    usageType: 'solid',
  },
  {
    id: 'litter-w4',
    petId: 'pet-whiskers',
    time: '15:20',
    durationSeconds: 85,
    depositGrams: 18,
    usageType: 'liquid',
  },
  {
    id: 'litter-w5',
    petId: 'pet-whiskers',
    time: '17:35',
    durationSeconds: 70,
    depositGrams: 14,
    usageType: 'unknown',
  },
];

export const MOCK_DEVICES: Record<string, DeviceStatus> = {
  'pet-buddy': {
    deviceName: 'Atronz Collar Pro',
    collarConnected: true,
    batteryPercent: 78,
    connectionQuality: 'excellent',
    lastSeenMinutesAgo: 12,
    activityState: 'walking',
    supportsHeartRate: true,
    supportsTemperature: true,
    heartRateBpm: 84,
    temperatureC: 38.4,
  },
  'pet-luna': {
    deviceName: 'Atronz Collar Pro',
    collarConnected: true,
    batteryPercent: 41,
    connectionQuality: 'good',
    lastSeenMinutesAgo: 41,
    activityState: 'resting',
    supportsHeartRate: true,
    supportsTemperature: true,
    heartRateBpm: 76,
    temperatureC: 38.1,
  },
  'pet-whiskers': {
    // The lightweight cat collar ships without the optional sensors.
    deviceName: 'Atronz Collar Lite',
    collarConnected: true,
    batteryPercent: 16,
    connectionQuality: 'fair',
    lastSeenMinutesAgo: 180,
    activityState: 'sleeping',
    supportsHeartRate: false,
    supportsTemperature: false,
    heartRateBpm: null,
    temperatureC: null,
  },
};

export const MOCK_ALERTS: PetAlert[] = [
  {
    id: 'alert-1',
    petId: 'pet-whiskers',
    title: 'Litter box visits above baseline',
    description: '5 visits today against a 3-visit daily average.',
    severity: 'warning',
    category: 'litter',
    timestamp: '25 min ago',
    read: false,
  },
  {
    id: 'alert-2',
    petId: 'pet-whiskers',
    title: 'Litter level is low',
    description: 'The tray is at 22%. Top it up before the evening.',
    severity: 'info',
    category: 'litter',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'alert-3',
    petId: 'pet-whiskers',
    title: 'Collar battery needs charging',
    description: 'Atronz Collar Lite is at 16%.',
    severity: 'warning',
    category: 'device',
    timestamp: '3 hours ago',
    read: true,
  },
  {
    id: 'alert-6',
    petId: 'pet-whiskers',
    title: 'Cleaning reminder',
    description: 'The tray was last cleaned 31 hours ago.',
    severity: 'info',
    category: 'litter',
    timestamp: '5 hours ago',
    read: false,
  },
  {
    id: 'alert-4',
    petId: 'pet-luna',
    title: 'Food intake lower than target',
    description: 'Only 1 of 2 meals logged so far today.',
    severity: 'warning',
    category: 'nutrition',
    timestamp: '4 hours ago',
    read: false,
  },
  {
    id: 'alert-5',
    petId: 'pet-luna',
    title: 'Vaccination due soon',
    description: 'The annual booster is scheduled in 12 days.',
    severity: 'info',
    category: 'general',
    timestamp: '2 days ago',
    read: true,
  },
];

export const MOCK_TIMELINE: TimelineEvent[] = [
  {
    id: 'tl-b1',
    petId: 'pet-buddy',
    type: 'collar',
    title: 'Collar synced',
    detail: 'Atronz Collar Pro reconnected on the home network.',
    timestamp: '12 min ago',
  },
  {
    id: 'tl-b2',
    petId: 'pet-buddy',
    type: 'score',
    title: 'Health score updated',
    detail: 'Daily wellness score recalculated.',
    timestamp: '1 hour ago',
  },
  {
    id: 'tl-b3',
    petId: 'pet-buddy',
    type: 'meal',
    title: 'Evening meal logged',
    detail: '320 g dry food · 590 kcal.',
    timestamp: '3 hours ago',
  },
  {
    id: 'tl-b4',
    petId: 'pet-buddy',
    type: 'rest',
    title: 'Rest period completed',
    detail: '2h 10m of deep rest after the afternoon walk.',
    timestamp: '5 hours ago',
  },
  {
    id: 'tl-b5',
    petId: 'pet-buddy',
    type: 'meal',
    title: 'Morning meal logged',
    detail: '310 g dry food · 590 kcal.',
    timestamp: '9 hours ago',
  },
  {
    id: 'tl-l1',
    petId: 'pet-luna',
    type: 'alert',
    title: 'Food intake flagged',
    detail: 'Evening meal still pending at 6:00 PM.',
    timestamp: '40 min ago',
  },
  {
    id: 'tl-l2',
    petId: 'pet-luna',
    type: 'collar',
    title: 'Collar synced',
    detail: 'Atronz Collar Pro last seen 41 minutes ago.',
    timestamp: '41 min ago',
  },
  {
    id: 'tl-l3',
    petId: 'pet-luna',
    type: 'rest',
    title: 'Rest period completed',
    detail: '1h 45m of light rest.',
    timestamp: '2 hours ago',
  },
  {
    id: 'tl-l4',
    petId: 'pet-luna',
    type: 'meal',
    title: 'Morning meal logged',
    detail: '280 g dry food · 960 kcal.',
    timestamp: '8 hours ago',
  },
  {
    id: 'tl-l5',
    petId: 'pet-luna',
    type: 'score',
    title: 'Health score updated',
    detail: 'Daily wellness score recalculated.',
    timestamp: 'Yesterday',
  },
  {
    id: 'tl-w1',
    petId: 'pet-whiskers',
    type: 'litter',
    title: 'Litter box visit recorded',
    detail: 'Visit 5 of the day · 1m 40s.',
    timestamp: '25 min ago',
  },
  {
    id: 'tl-w2',
    petId: 'pet-whiskers',
    type: 'alert',
    title: 'Unusual pattern flagged',
    detail: 'Litter visits above the usual baseline.',
    timestamp: '25 min ago',
  },
  {
    id: 'tl-w3',
    petId: 'pet-whiskers',
    type: 'rest',
    title: 'Rest period completed',
    detail: '4h 20m of deep rest on the window sill.',
    timestamp: '2 hours ago',
  },
  {
    id: 'tl-w4',
    petId: 'pet-whiskers',
    type: 'meal',
    title: 'Midday meal logged',
    detail: '45 g wet food · 90 kcal.',
    timestamp: '6 hours ago',
  },
  {
    id: 'tl-w5',
    petId: 'pet-whiskers',
    type: 'collar',
    title: 'Collar synced',
    detail: 'Atronz Collar Lite last seen 3 hours ago.',
    timestamp: '3 hours ago',
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'note-1',
    title: 'Whiskers — litter activity up',
    description: 'Atronz flagged a change in bathroom frequency.',
    timestamp: '25 min ago',
    read: false,
    severity: 'warning',
  },
  {
    id: 'note-2',
    title: 'Weekly report is ready',
    description: 'Your three-pet household summary for this week.',
    timestamp: '3 hours ago',
    read: false,
    severity: 'info',
  },
  {
    id: 'note-3',
    title: 'Buddy hit his step goal',
    description: '8,420 steps — 94% of the daily target.',
    timestamp: 'Yesterday',
    read: true,
    severity: 'info',
  },
];

export const MOCK_USER: UserProfile = {
  id: 'user-1',
  name: 'Sara Ali',
  email: 'sara@atronz.app',
  plan: 'Atronz Premium',
  memberSince: 'Member since 2024',
};
