import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { fetchBootstrap } from '@/lib/api';
import type { DashboardBootstrap } from '@/lib/api';
import { computeHealthScore } from '@/lib/healthScore';
import { generateInsight } from '@/lib/insights';
import { buildMetrics } from '@/lib/metrics';
import {
  generateNutritionInsight,
  mealsFor,
  sortMeals,
  summarizeNutrition,
  withNutrition,
} from '@/lib/nutrition';
import type { NutritionInsight } from '@/lib/nutrition';
import {
  buildLitterBaseline,
  buildLitterSeries,
  generateLitterInsight,
  litterDeviceFor,
  litterEventsFor,
  litterTotals,
  summarizeLitter,
} from '@/lib/litter';
import type { LitterInsight } from '@/lib/litter';
import {
  buildActivitySeries,
  buildBaselineComparison,
  buildRestSeries,
  buildWeightTrend,
  dayLabels,
} from '@/lib/trends';
import type { WeightTrend } from '@/lib/trends';
import {
  markTrayCleaned as runMarkCleaned,
  mealTimelineEvent,
  simulateHealthChange as runHealthChange,
  simulateLitterUsage as runLitterUsage,
  simulateLiveUpdate as runLiveUpdate,
  simulateLowLitter as runLowLitter,
  simulateMissedMeal as runMissedMeal,
} from '@/lib/simulation';
import type {
  AiInsight,
  AppNotification,
  BaselineRow,
  DeviceStatus,
  FoodProfile,
  LitterDevice,
  LitterEvent,
  LitterSummary,
  MealCategory,
  MealEntry,
  PetSex,
  PetVitals,
  Species,
  Vaccination,
  NutritionSummary,
  HealthScore,
  Pet,
  PetAlert,
  PetMetrics,
  DerivedVitals,
  SeriesPoint,
  TimelineEvent,
  UserProfile,
} from '@/types';

type Status = 'loading' | 'ready' | 'error';

/** Everything the log-food form collects. */
export interface NewMealDraft {
  name: string;
  foodType: string;
  quantity: number;
  unit: string;
  calories: number | null;
  category: MealCategory;
  time: string;
  isTreat: boolean;
  notes?: string;
}

let mealSequence = 0;
let petSequence = 0;

/** Everything the add/edit pet forms collect. */
export interface PetDraft {
  name: string;
  species: Species;
  breed: string;
  ageYears: number;
  ageMonths: number;
  sex: PetSex;
  weightKg: number;
  photoUrl: string;
  vetClinic: string;
  preferredFood: string;
  /** Owner-provided. Atronz never infers or assesses these. */
  allergies: string;
  restrictions: string;
  notes: string;
}

/**
 * Starting telemetry for a newly added pet: sensible daily goals so nothing
 * divides by zero, but zero recorded activity and no baselines, which is what
 * drives the "no data yet" states across the other screens.
 */
function blankVitals(species: Species): PetVitals {
  const isCat = species === 'cat';
  return {
    steps: 0,
    stepGoal: isCat ? 4500 : 8000,
    baselineSteps: 0,
    restMinutes: 0,
    restGoalMinutes: isCat ? 840 : 720,
    baselineRestMinutes: 0,
    calorieTarget: isCat ? 250 : 900,
    waterMl: null,
    waterTargetMl: null,
    litterBaselineVisits: null,
    litterBaselineDurationSeconds: null,
  };
}

interface AppDataValue {
  status: Status;
  error: string | null;
  reload: () => void;

  /** Active pets only. Archived ones keep their data but leave this list. */
  pets: Pet[];
  archivedPets: Pet[];
  vaccinations: Vaccination[];
  selectedPet: Pet | null;
  selectedPetId: string | null;
  selectPet: (petId: string) => void;

  /** Everything below is derived from raw vitals for the selected pet. */
  /** Raw vitals with the derived nutrition totals merged in. */
  vitals: DerivedVitals | null;
  device: DeviceStatus | null;
  meals: MealEntry[];
  nutrition: NutritionSummary | null;
  nutritionInsight: NutritionInsight | null;
  foodProfile: FoodProfile | null;

  /** `null` for pets without a paired tray — the not-applicable signal. */
  litterDevice: LitterDevice | null;
  litterEvents: LitterEvent[];
  litterSummary: LitterSummary | null;
  litterInsight: LitterInsight | null;
  litterSeries: SeriesPoint[];
  litterBaselineRows: BaselineRow[];
  litterAlerts: PetAlert[];
  metrics: PetMetrics | null;
  healthScore: HealthScore | null;
  insight: AiInsight | null;
  activitySeries: SeriesPoint[];
  restSeries: SeriesPoint[];
  weightTrend: WeightTrend | null;
  baselineRows: BaselineRow[];
  alerts: PetAlert[];
  timeline: TimelineEvent[];

  /** Score for any pet — used by the My Pets grid. */
  scoreFor: (petId: string) => HealthScore | null;
  /** Everything the My Pets grid and profile drawer need for one pet. */
  petDetail: (petId: string) => PetDetail;

  alertsUnreadCount: number;
  markAlertRead: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;

  user: UserProfile | null;
  notifications: AppNotification[];
  unreadCount: number;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;

  /** Demo controls. Every mutation they make is simulated, never real data. */
  simulateLiveUpdate: () => string | null;
  simulateHealthChange: () => string | null;
  simulateMissedMeal: () => string | null;
  simulateLitterUsage: () => string | null;
  simulateLowLitter: () => string | null;
  markTrayCleaned: () => string | null;

  /** Nutrition actions. Meals are the source of truth for calorie totals. */
  logMeal: (draft: NewMealDraft) => string | null;
  completeScheduledMeal: (mealId: string) => string | null;

  /** Pet management. Archiving preserves every record keyed to the pet. */
  addPet: (draft: PetDraft) => string | null;
  updatePet: (petId: string, draft: PetDraft) => string | null;
  archivePet: (petId: string) => string | null;
  restorePet: (petId: string) => string | null;
  resetDemoData: () => void;
  demoModified: boolean;
}

/** Per-pet slice, for any pet rather than just the selected one. */
export interface PetDetail {
  device: DeviceStatus | null;
  litterDevice: LitterDevice | null;
  foodProfile: FoodProfile | null;
  vaccinations: Vaccination[];
  timeline: TimelineEvent[];
  alerts: PetAlert[];
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [data, setData] = useState<DashboardBootstrap | null>(null);
  /** Pristine copy kept aside so "Reset demo data" is exact. */
  const [pristine, setPristine] = useState<DashboardBootstrap | null>(null);
  const [demoModified, setDemoModified] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    fetchBootstrap()
      .then((bootstrap) => {
        if (cancelled) return;
        setData(bootstrap);
        setPristine(bootstrap);
        setDemoModified(false);
        setSelectedPetId((current) => {
          const active = bootstrap.pets.filter((pet) => !pet.archived);
          const stillExists = active.some((pet) => pet.id === current);
          return stillExists ? current : (active[0]?.id ?? null);
        });
        setStatus('ready');
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(
          cause instanceof Error
            ? cause.message
            : 'We could not load your pets right now.',
        );
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);
  const selectPet = useCallback((petId: string) => setSelectedPetId(petId), []);

  const allPets = useMemo(() => data?.pets ?? [], [data?.pets]);
  const pets = useMemo(
    () => allPets.filter((pet) => !pet.archived),
    [allPets],
  );
  const archivedPets = useMemo(
    () => allPets.filter((pet) => pet.archived),
    [allPets],
  );
  const selectedPet = useMemo(
    () => allPets.find((pet) => pet.id === selectedPetId) ?? null,
    [allPets, selectedPetId],
  );

  const vaccinations = useMemo(
    () =>
      (data?.vaccinations ?? []).filter(
        (record) => record.petId === selectedPetId,
      ),
    [data?.vaccinations, selectedPetId],
  );

  const rawVitals =
    data && selectedPetId ? (data.vitals[selectedPetId] ?? null) : null;

  const meals = useMemo(
    () => sortMeals(mealsFor(data?.meals ?? [], selectedPetId)),
    [data?.meals, selectedPetId],
  );

  const nutrition = useMemo(
    () => (rawVitals ? summarizeNutrition(rawVitals, meals) : null),
    [rawVitals, meals],
  );

  const litterDevice = useMemo(
    () => litterDeviceFor(data?.litterDevices ?? [], selectedPetId),
    [data?.litterDevices, selectedPetId],
  );

  const litterEvents = useMemo(
    () => litterEventsFor(data?.litterEvents ?? [], selectedPetId),
    [data?.litterEvents, selectedPetId],
  );

  const litterSummary = useMemo(
    () => (rawVitals ? summarizeLitter(rawVitals, litterDevice, litterEvents) : null),
    [rawVitals, litterDevice, litterEvents],
  );

  // Everything downstream reads calories, meal counts and tray visits from the
  // meal and litter lists rather than from stored numbers.
  const vitals = useMemo(
    () =>
      rawVitals
        ? {
            ...withNutrition(rawVitals, meals),
            ...litterTotals(rawVitals, litterDevice, litterEvents),
          }
        : null,
    [rawVitals, meals, litterDevice, litterEvents],
  );

  const litterInsight = useMemo(
    () =>
      selectedPet && litterSummary
        ? generateLitterInsight(selectedPet, litterSummary)
        : null,
    [selectedPet, litterSummary],
  );

  const litterBaselineRows = useMemo(
    () => (litterSummary ? buildLitterBaseline(litterSummary) : []),
    [litterSummary],
  );

  const foodProfile = useMemo(
    () =>
      data?.foodProfiles.find((profile) => profile.petId === selectedPetId) ??
      null,
    [data?.foodProfiles, selectedPetId],
  );

  const nutritionInsight = useMemo(
    () =>
      selectedPet && nutrition
        ? generateNutritionInsight(selectedPet, nutrition)
        : null,
    [selectedPet, nutrition],
  );
  const device =
    data && selectedPetId ? (data.devices[selectedPetId] ?? null) : null;
  const history =
    data && selectedPetId ? (data.history[selectedPetId] ?? null) : null;

  const healthScore = useMemo(
    () => (selectedPet && vitals ? computeHealthScore(selectedPet, vitals) : null),
    [selectedPet, vitals],
  );

  const metrics = useMemo(
    () => (selectedPet && vitals ? buildMetrics(selectedPet, vitals) : null),
    [selectedPet, vitals],
  );

  const insight = useMemo(
    () =>
      selectedPet && vitals && device && healthScore
        ? generateInsight(
            selectedPet,
            vitals,
            device,
            healthScore,
            demoModified ? 'Updated just now' : 'Updated a few minutes ago',
          )
        : null,
    [selectedPet, vitals, device, healthScore, demoModified],
  );

  const activitySeries = useMemo(
    () => (vitals ? buildActivitySeries(vitals, history) : []),
    [vitals, history],
  );

  const restSeries = useMemo(
    () => (vitals ? buildRestSeries(vitals, history) : []),
    [vitals, history],
  );

  const weightTrend = useMemo(
    () => (selectedPet ? buildWeightTrend(selectedPet, history) : null),
    [selectedPet, history],
  );

  const baselineRows = useMemo(
    () =>
      selectedPet && vitals ? buildBaselineComparison(selectedPet, vitals) : [],
    [selectedPet, vitals],
  );

  const litterSeries = useMemo(
    () =>
      litterSummary
        ? buildLitterSeries(
            history,
            litterSummary.visitsToday,
            dayLabels((history?.litterVisits.length ?? 0) + 1),
          )
        : [],
    [history, litterSummary],
  );

  const alerts = useMemo(
    () => (data ? data.alerts.filter((a) => a.petId === selectedPetId) : []),
    [data, selectedPetId],
  );

  const timeline = useMemo(
    () => (data ? data.timeline.filter((e) => e.petId === selectedPetId) : []),
    [data, selectedPetId],
  );

  const scoreFor = useCallback(
    (petId: string): HealthScore | null => {
      if (!data) return null;
      const pet = data.pets.find((p) => p.id === petId);
      const petVitals = data.vitals[petId];
      if (!pet || !petVitals) return null;
      return computeHealthScore(pet, {
        ...withNutrition(petVitals, mealsFor(data.meals, petId)),
        ...litterTotals(
          petVitals,
          litterDeviceFor(data.litterDevices, petId),
          litterEventsFor(data.litterEvents, petId),
        ),
      });
    },
    [data],
  );

  const petDetail = useCallback(
    (petId: string): PetDetail => {
      if (!data) {
        return {
          device: null,
          litterDevice: null,
          foodProfile: null,
          vaccinations: [],
          timeline: [],
          alerts: [],
        };
      }
      return {
        device: data.devices[petId] ?? null,
        litterDevice: litterDeviceFor(data.litterDevices, petId),
        foodProfile:
          data.foodProfiles.find((profile) => profile.petId === petId) ?? null,
        vaccinations: data.vaccinations.filter(
          (record) => record.petId === petId,
        ),
        timeline: data.timeline.filter((event) => event.petId === petId),
        alerts: data.alerts.filter((alert) => alert.petId === petId),
      };
    },
    [data],
  );

  const markAlertRead = useCallback((alertId: string) => {
    setData((current) =>
      current
        ? {
            ...current,
            alerts: current.alerts.map((alert) =>
              alert.id === alertId ? { ...alert, read: true } : alert,
            ),
          }
        : current,
    );
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setDemoModified(true);
    setData((current) =>
      current
        ? {
            ...current,
            alerts: current.alerts.filter((alert) => alert.id !== alertId),
          }
        : current,
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setData((current) =>
      current
        ? {
            ...current,
            notifications: current.notifications.map((note) =>
              note.read ? note : { ...note, read: true },
            ),
          }
        : current,
    );
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setData((current) =>
      current
        ? {
            ...current,
            notifications: current.notifications.map((note) =>
              note.id === id ? { ...note, read: true } : note,
            ),
          }
        : current,
    );
  }, []);

  const simulateLiveUpdate = useCallback((): string | null => {
    if (!data || !selectedPet || !selectedPetId) return null;
    const petVitals = data.vitals[selectedPetId];
    const petDevice = data.devices[selectedPetId];
    if (!petVitals || !petDevice) return null;

    const result = runLiveUpdate(selectedPet, petVitals, petDevice);
    setDemoModified(true);
    setData((current) =>
      current
        ? {
            ...current,
            vitals: { ...current.vitals, [selectedPetId]: result.vitals },
            devices: { ...current.devices, [selectedPetId]: result.device },
            timeline: [result.event, ...current.timeline],
          }
        : current,
    );
    return result.message;
  }, [data, selectedPet, selectedPetId]);

  const simulateHealthChange = useCallback((): string | null => {
    if (!data || !selectedPet || !selectedPetId) return null;
    const petVitals = data.vitals[selectedPetId];
    if (!petVitals) return null;

    const result = runHealthChange(selectedPet, petVitals);

    // Calories are summed from meals, so "less food" means marking meals missed.
    const toMiss = new Set(
      sortMeals(
        data.meals.filter(
          (meal) =>
            meal.petId === selectedPetId &&
            !meal.isTreat &&
            meal.status !== 'missed',
        ),
      )
        .slice(-result.missedMeals)
        .map((meal) => meal.id),
    );

    const extraVisits: LitterEvent[] = litterDevice
      ? Array.from({ length: result.extraLitterVisits }, (_, index) =>
          runLitterUsage(selectedPet, litterEvents.length + index).event,
        )
      : [];

    setDemoModified(true);
    setData((current) =>
      current
        ? {
            ...current,
            vitals: { ...current.vitals, [selectedPetId]: result.vitals },
            meals: current.meals.map((meal) =>
              toMiss.has(meal.id) ? { ...meal, status: 'missed' } : meal,
            ),
            litterEvents: [...current.litterEvents, ...extraVisits],
            alerts: [...result.alerts, ...current.alerts],
            notifications: [result.notification, ...current.notifications],
            timeline: [...result.events, ...current.timeline],
          }
        : current,
    );
    return result.message;
  }, [data, selectedPet, selectedPetId, litterDevice, litterEvents.length]);

  const logMeal = useCallback(
    (draft: NewMealDraft): string | null => {
      if (!data || !selectedPet || !selectedPetId) return null;

      const meal: MealEntry = {
        id: `meal-${Date.now()}-${mealSequence++}`,
        petId: selectedPetId,
        name: draft.name,
        foodType: draft.foodType,
        quantity: draft.quantity,
        unit: draft.unit,
        calories: draft.calories,
        category: draft.isTreat ? 'treat' : draft.category,
        time: draft.time,
        status: 'logged',
        isTreat: draft.isTreat,
        notes: draft.notes?.trim() ? draft.notes.trim() : undefined,
      };

      setDemoModified(true);
      setData((current) =>
        current
          ? {
              ...current,
              meals: [...current.meals, meal],
              timeline: [
                mealTimelineEvent(selectedPet, meal, 'logged'),
                ...current.timeline,
              ],
            }
          : current,
      );
      return `${meal.name} logged for ${selectedPet.name}`;
    },
    [data, selectedPet, selectedPetId],
  );

  const completeScheduledMeal = useCallback(
    (mealId: string): string | null => {
      if (!data || !selectedPet) return null;
      const meal = data.meals.find((entry) => entry.id === mealId);
      if (!meal || meal.status === 'logged') return null;

      const served: MealEntry = { ...meal, status: 'logged' };
      setDemoModified(true);
      setData((current) =>
        current
          ? {
              ...current,
              meals: current.meals.map((entry) =>
                entry.id === mealId ? served : entry,
              ),
              timeline: [
                mealTimelineEvent(selectedPet, served, 'completed'),
                ...current.timeline,
              ],
            }
          : current,
      );
      return `${served.name} marked as served`;
    },
    [data, selectedPet],
  );

  const simulateMissedMeal = useCallback((): string | null => {
    if (!data || !selectedPet || !selectedPetId) return null;
    const candidates = sortMeals(
      data.meals.filter(
        (meal) =>
          meal.petId === selectedPetId && !meal.isTreat && meal.status !== 'missed',
      ),
    );
    // Prefer a still-pending meal; otherwise walk back the last one served.
    const target =
      candidates.find((meal) => meal.status === 'planned') ??
      candidates[candidates.length - 1];
    if (!target) return null;

    const result = runMissedMeal(selectedPet, target);
    setDemoModified(true);
    setData((current) =>
      current
        ? {
            ...current,
            meals: current.meals.map((meal) =>
              meal.id === target.id ? { ...meal, status: 'missed' } : meal,
            ),
            alerts: [result.alert, ...current.alerts],
            notifications: [result.notification, ...current.notifications],
            timeline: [result.event, ...current.timeline],
          }
        : current,
    );
    return result.message;
  }, [data, selectedPet, selectedPetId]);

  const simulateLitterUsage = useCallback((): string | null => {
    if (!data || !selectedPet || !selectedPetId || !litterDevice) return null;
    const result = runLitterUsage(selectedPet, litterEvents.length);
    setDemoModified(true);
    setData((current) =>
      current
        ? {
            ...current,
            litterEvents: [...current.litterEvents, result.event],
            litterDevices: current.litterDevices.map((device) =>
              device.petId === selectedPetId
                ? { ...device, lastSyncMinutesAgo: 0 }
                : device,
            ),
            timeline: [result.timelineEvent, ...current.timeline],
          }
        : current,
    );
    return result.message;
  }, [data, selectedPet, selectedPetId, litterDevice, litterEvents.length]);

  const simulateLowLitter = useCallback((): string | null => {
    if (!data || !selectedPet || !selectedPetId || !litterDevice) return null;
    const result = runLowLitter(selectedPet, litterDevice);
    setDemoModified(true);
    setData((current) =>
      current
        ? {
            ...current,
            litterDevices: current.litterDevices.map((device) =>
              device.petId === selectedPetId ? result.device : device,
            ),
            alerts: [result.alert, ...current.alerts],
            notifications: [result.notification, ...current.notifications],
            timeline: [result.timelineEvent, ...current.timeline],
          }
        : current,
    );
    return result.message;
  }, [data, selectedPet, selectedPetId, litterDevice]);

  const markTrayCleaned = useCallback((): string | null => {
    if (!data || !selectedPet || !selectedPetId || !litterDevice) return null;
    const result = runMarkCleaned(selectedPet, litterDevice);
    setDemoModified(true);
    setData((current) =>
      current
        ? {
            ...current,
            litterDevices: current.litterDevices.map((device) =>
              device.petId === selectedPetId ? result.device : device,
            ),
            // Cleaning resolves the low-litter and cleaning-reminder alerts.
            alerts: current.alerts.filter(
              (alert) =>
                !(
                  alert.petId === selectedPetId &&
                  alert.category === 'litter' &&
                  /litter level|cleaning reminder/i.test(alert.title)
                ),
            ),
            timeline: [result.timelineEvent, ...current.timeline],
          }
        : current,
    );
    return result.message;
  }, [data, selectedPet, selectedPetId, litterDevice]);

  /** Splits a comma-separated owner entry into clean chips. */
  const splitList = (value: string): string[] =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const addPet = useCallback(
    (draft: PetDraft): string | null => {
      if (!data) return null;
      const id = `pet-${Date.now()}-${petSequence++}`;

      const pet: Pet = {
        id,
        name: draft.name,
        species: draft.species,
        breed: draft.breed,
        ageYears: draft.ageYears,
        ageMonths: draft.ageMonths,
        weightKg: draft.weightKg,
        sex: draft.sex,
        photoUrl: draft.photoUrl.trim() || undefined,
        previousHealthScore: 0,
        microchipId: 'Not registered',
        vetClinic: draft.vetClinic.trim() || 'No clinic on file',
        archived: false,
      };

      setDemoModified(true);
      setData((current) =>
        current
          ? {
              ...current,
              pets: [...current.pets, pet],
              vitals: { ...current.vitals, [id]: blankVitals(draft.species) },
              // No collar, no tray, no meals, no alerts - a genuinely empty pet.
              history: {
                ...current.history,
                [id]: {
                  steps: [],
                  restMinutes: [],
                  litterVisits: [],
                  weights: [],
                },
              },
              foodProfiles: [
                ...current.foodProfiles,
                {
                  petId: id,
                  preferredFood: draft.preferredFood.trim() || null,
                  allergies: splitList(draft.allergies),
                  restrictions: splitList(draft.restrictions),
                  treatPreferences: [],
                  notes: draft.notes.trim() || null,
                },
              ],
              timeline: [
                {
                  id: `tl-${Date.now()}-${petSequence}`,
                  petId: id,
                  type: 'score',
                  title: 'Pet added',
                  detail: `${pet.name} was added to the account.`,
                  timestamp: 'Just now',
                },
                ...current.timeline,
              ],
            }
          : current,
      );
      setSelectedPetId(id);
      return `${pet.name} added to your household`;
    },
    [data],
  );

  const updatePet = useCallback(
    (petId: string, draft: PetDraft): string | null => {
      if (!data) return null;
      const existing = data.pets.find((pet) => pet.id === petId);
      if (!existing) return null;

      setDemoModified(true);
      setData((current) =>
        current
          ? {
              ...current,
              // Only profile fields change. Vitals, meals, litter events,
              // history, alerts and the timeline are keyed by pet id and are
              // deliberately left untouched.
              pets: current.pets.map((pet) =>
                pet.id === petId
                  ? {
                      ...pet,
                      name: draft.name,
                      breed: draft.breed,
                      ageYears: draft.ageYears,
                      ageMonths: draft.ageMonths,
                      sex: draft.sex,
                      weightKg: draft.weightKg,
                      photoUrl: draft.photoUrl.trim() || undefined,
                      vetClinic: draft.vetClinic.trim() || pet.vetClinic,
                    }
                  : pet,
              ),
              foodProfiles: current.foodProfiles.some(
                (profile) => profile.petId === petId,
              )
                ? current.foodProfiles.map((profile) =>
                    profile.petId === petId
                      ? {
                          ...profile,
                          preferredFood: draft.preferredFood.trim() || null,
                          allergies: splitList(draft.allergies),
                          restrictions: splitList(draft.restrictions),
                          notes: draft.notes.trim() || null,
                        }
                      : profile,
                  )
                : [
                    ...current.foodProfiles,
                    {
                      petId,
                      preferredFood: draft.preferredFood.trim() || null,
                      allergies: splitList(draft.allergies),
                      restrictions: splitList(draft.restrictions),
                      treatPreferences: [],
                      notes: draft.notes.trim() || null,
                    },
                  ],
            }
          : current,
      );
      return `${draft.name} profile updated`;
    },
    [data],
  );

  const archivePet = useCallback(
    (petId: string): string | null => {
      if (!data) return null;
      const pet = data.pets.find((entry) => entry.id === petId);
      const activeCount = data.pets.filter((entry) => !entry.archived).length;
      // Never archive the last active pet - the app needs one selected.
      if (!pet || pet.archived || activeCount <= 1) return null;

      setDemoModified(true);
      setData((current) =>
        current
          ? {
              ...current,
              pets: current.pets.map((entry) =>
                entry.id === petId ? { ...entry, archived: true } : entry,
              ),
            }
          : current,
      );

      if (selectedPetId === petId) {
        const next = data.pets.find(
          (entry) => entry.id !== petId && !entry.archived,
        );
        setSelectedPetId(next?.id ?? null);
      }
      return `${pet.name} archived`;
    },
    [data, selectedPetId],
  );

  const restorePet = useCallback(
    (petId: string): string | null => {
      if (!data) return null;
      const pet = data.pets.find((entry) => entry.id === petId);
      if (!pet || !pet.archived) return null;

      setDemoModified(true);
      setData((current) =>
        current
          ? {
              ...current,
              pets: current.pets.map((entry) =>
                entry.id === petId ? { ...entry, archived: false } : entry,
              ),
            }
          : current,
      );
      return `${pet.name} restored`;
    },
    [data],
  );

  const resetDemoData = useCallback(() => {
    if (!pristine) return;
    setData(JSON.parse(JSON.stringify(pristine)) as DashboardBootstrap);
    setDemoModified(false);
  }, [pristine]);

  const notifications = data?.notifications ?? [];

  const value = useMemo<AppDataValue>(
    () => ({
      status,
      error,
      reload,
      pets,
      archivedPets,
      vaccinations,
      selectedPet,
      selectedPetId,
      selectPet,
      vitals,
      device,
      meals,
      nutrition,
      nutritionInsight,
      foodProfile,
      litterDevice,
      litterEvents,
      litterSummary,
      litterInsight,
      litterSeries,
      litterBaselineRows,
      litterAlerts: alerts.filter((alert) => alert.category === 'litter'),
      metrics,
      healthScore,
      insight,
      activitySeries,
      restSeries,
      weightTrend,
      baselineRows,
      alerts,
      timeline,
      scoreFor,
      petDetail,
      alertsUnreadCount: alerts.filter((alert) => !alert.read).length,
      markAlertRead,
      dismissAlert,
      user: data?.user ?? null,
      notifications,
      unreadCount: notifications.filter((note) => !note.read).length,
      markAllNotificationsRead,
      markNotificationRead,
      simulateLiveUpdate,
      simulateHealthChange,
      simulateMissedMeal,
      simulateLitterUsage,
      simulateLowLitter,
      markTrayCleaned,
      logMeal,
      completeScheduledMeal,
      addPet,
      updatePet,
      archivePet,
      restorePet,
      resetDemoData,
      demoModified,
    }),
    [
      status,
      error,
      reload,
      pets,
      archivedPets,
      vaccinations,
      selectedPet,
      selectedPetId,
      selectPet,
      vitals,
      device,
      meals,
      nutrition,
      nutritionInsight,
      foodProfile,
      litterDevice,
      litterEvents,
      litterSummary,
      litterInsight,
      litterSeries,
      litterBaselineRows,
      metrics,
      healthScore,
      insight,
      activitySeries,
      restSeries,
      weightTrend,
      baselineRows,
      alerts,
      timeline,
      scoreFor,
      petDetail,
      markAlertRead,
      dismissAlert,
      data?.user,
      notifications,
      markAllNotificationsRead,
      markNotificationRead,
      simulateLiveUpdate,
      simulateHealthChange,
      simulateMissedMeal,
      simulateLitterUsage,
      simulateLowLitter,
      markTrayCleaned,
      logMeal,
      completeScheduledMeal,
      addPet,
      updatePet,
      archivePet,
      restorePet,
      resetDemoData,
      demoModified,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData(): AppDataValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used inside an <AppDataProvider>.');
  }
  return context;
}
