import {
  MOCK_ALERTS,
  MOCK_DEVICES,
  MOCK_FOOD_PROFILES,
  MOCK_HISTORY,
  MOCK_LITTER_DEVICES,
  MOCK_LITTER_EVENTS,
  MOCK_MEALS,
  MOCK_NOTIFICATIONS,
  MOCK_PETS,
  MOCK_TIMELINE,
  MOCK_USER,
  MOCK_VACCINATIONS,
  MOCK_VITALS,
} from '@/data/mockData';
import type {
  AppNotification,
  DeviceStatus,
  FoodProfile,
  LitterDevice,
  LitterEvent,
  MealEntry,
  Pet,
  PetAlert,
  PetHistory,
  PetVitals,
  TimelineEvent,
  UserProfile,
  Vaccination,
} from '@/types';

/**
 * The single seam between the UI and its data source.
 *
 * Everything here is async and returns plain domain objects, so replacing the
 * mock bodies with `fetch(...)` calls later requires no component changes.
 */

const LATENCY_MS = 450;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

export interface DashboardBootstrap {
  pets: Pet[];
  vitals: Record<string, PetVitals>;
  history: Record<string, PetHistory>;
  meals: MealEntry[];
  litterDevices: LitterDevice[];
  litterEvents: LitterEvent[];
  foodProfiles: FoodProfile[];
  vaccinations: Vaccination[];
  devices: Record<string, DeviceStatus>;
  alerts: PetAlert[];
  timeline: TimelineEvent[];
  notifications: AppNotification[];
  user: UserProfile;
}

/**
 * Deep clone so in-memory demo mutations never corrupt the module constants.
 * JSON round-trip rather than `structuredClone`: the payload is plain JSON and
 * this works on every WebView Capacitor may land on.
 */
function snapshot(): DashboardBootstrap {
  return JSON.parse(
    JSON.stringify({
      pets: MOCK_PETS,
      vitals: MOCK_VITALS,
      history: MOCK_HISTORY,
      meals: MOCK_MEALS,
      litterDevices: MOCK_LITTER_DEVICES,
      litterEvents: MOCK_LITTER_EVENTS,
      foodProfiles: MOCK_FOOD_PROFILES,
      vaccinations: MOCK_VACCINATIONS,
      devices: MOCK_DEVICES,
      alerts: MOCK_ALERTS,
      timeline: MOCK_TIMELINE,
      notifications: MOCK_NOTIFICATIONS,
      user: MOCK_USER,
    }),
  ) as DashboardBootstrap;
}

export async function fetchBootstrap(): Promise<DashboardBootstrap> {
  return delay(snapshot());
}
