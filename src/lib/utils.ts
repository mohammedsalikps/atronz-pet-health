import type {
  ActivityState,
  ConnectionQuality,
  HealthStatus,
  InsightTone,
  Pet,
} from '@/types';

/** Tiny classnames joiner — keeps conditional Tailwind lists readable. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function petAgeLabel(pet: Pet): string {
  const years = pet.ageYears === 1 ? '1 yr' : `${pet.ageYears} yrs`;
  if (pet.ageMonths === 0) return years;
  return `${years} ${pet.ageMonths} mo`;
}

/** "Buddy" -> "Buddy's", "Whiskers" -> "Whiskers'". */
export function possessive(name: string): string {
  return name.endsWith('s') ? `${name}'` : `${name}'s`;
}

export function petSubtitle(pet: Pet): string {
  return `${pet.breed} • ${petAgeLabel(pet)} • ${pet.weightKg} kg`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

/** 680 → "11h 20m", 45 → "45m". */
export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${String(mins).padStart(2, '0')}m`;
}

/** 0 → "Just now", 41 → "41 min ago", 180 → "3 hours ago". */
export function formatMinutesAgo(minutes: number): string {
  if (minutes <= 0) return 'Just now';
  if (minutes === 1) return '1 min ago';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
}

const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  excellent: 'Excellent',
  good: 'Doing well',
  monitor: 'Worth monitoring',
  attention: 'Needs attention',
  pending: 'No data yet',
};

export function healthStatusLabel(status: HealthStatus): string {
  return HEALTH_STATUS_LABELS[status];
}

const HEALTH_HEADLINES: Record<HealthStatus, string> = {
  excellent: 'is having a great day',
  good: 'is doing well today',
  monitor: 'is worth keeping an eye on',
  attention: 'needs some attention today',
  pending: 'has no readings recorded yet',
};

/** Sentence fragment for the score card headline, e.g. "Buddy is doing well today". */
export function healthHeadline(name: string, status: HealthStatus): string {
  return `${name} ${HEALTH_HEADLINES[status]}`;
}

/** Tailwind classes for the pill that carries a health status. */
export function healthStatusTone(status: HealthStatus): string {
  switch (status) {
    case 'excellent':
      return 'bg-sage-100 text-sage-700 border-sage-200';
    case 'good':
      return 'bg-sage-50 text-sage-700 border-sage-100';
    case 'monitor':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'attention':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'pending':
      return 'bg-cream-100 text-charcoal-500 border-cream-300';
  }
}

export function insightToneClasses(tone: InsightTone): {
  chip: string;
  accent: string;
} {
  switch (tone) {
    case 'positive':
      return {
        chip: 'bg-sage-100 text-sage-700',
        accent: 'text-sage-600',
      };
    case 'watch':
      return {
        chip: 'bg-amber-50 text-amber-700',
        accent: 'text-amber-600',
      };
    case 'attention':
      return {
        chip: 'bg-red-50 text-red-700',
        accent: 'text-red-600',
      };
  }
}

export const INSIGHT_TONE_LABELS: Record<InsightTone, string> = {
  positive: 'Normal pattern',
  watch: 'Worth watching',
  attention: 'Unusual pattern',
};

export const ACTIVITY_STATE_LABELS: Record<ActivityState, string> = {
  resting: 'Resting',
  sleeping: 'Sleeping',
  walking: 'Walking',
  playing: 'Playing',
  eating: 'Eating',
};

export const CONNECTION_QUALITY_LABELS: Record<ConnectionQuality, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

/** Formats today's date. Computed per render so a resumed app is never stale. */
export function todayLabel(date: Date = new Date()): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

/** Greeting that matches the time of day on the user's device. */
export function greetingForNow(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
