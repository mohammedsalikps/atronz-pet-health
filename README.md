# Atronz Pet Health App

Premium pet-health dashboard. React + TypeScript + Vite + Tailwind CSS, structured
so the same `dist/` build can be wrapped as an Android APK with Capacitor later.

**Status: Step 7 — production-polished, ready for Capacitor packaging.**
All five screens complete (Overview, Health, Nutrition, Litter, My Pets).

## Branding

The official Atronz Innovations logo is the single source for every brand
surface. `brand/atronz-logo-source.png` is the supplied artwork; everything
else is generated from it by:

```bash
npm run brand:web
```

That produces, with the paper background matted out to real transparency and
the artwork never recoloured or reproportioned:

| Output | Used for |
| --- | --- |
| `src/assets/brand/atronz-lockup.png` | Sidebar and mobile drawer |
| `src/assets/brand/atronz-mark.png` | Compact mobile header |
| `public/favicon.png`, `public/apple-touch-icon.png` | Browser tab, iOS home screen |
| `public/brand-lockup.png` | Pre-JS boot splash in `index.html` |
| `assets/icon*.png` | Android launcher (legacy + adaptive fore/background) |
| `assets/splash*.png` | Android splash screens |

Once `npx cap add android` has run, `npm run brand:native` writes the launcher
icons and splash screens into the native project at every density.

Both splash variants keep the light brand ground: the official wordmark is
charcoal, so a dark panel would hide it, and recolouring the logo is not an
option.

## Offline / Android readiness

The production build makes **no network requests to render**. Inter is bundled
as a single 48 KB latin-subset woff2 rather than fetched from Google Fonts, all
data is local mock state, and asset paths are relative (`base: './'`) so the
`dist/` folder works when served from the Android filesystem.

The three demo pet photos are the one remote resource. They are decorative: the
`Avatar` component falls back to an initials tile on load failure, verified by
forcing every image to error — the app stays fully functional with no broken
images and no layout shift. Swap the `photoUrl` values in `mockData.ts` for
imported local files if you want zero remote requests at all.

## Adding a pet

A pet added from My Pets is genuinely empty: default daily goals so nothing
divides by zero, but zero recorded activity, no baselines, no collar, no tray,
no meals and no alerts. Every screen then falls into its own "no data yet"
state rather than inventing readings:

| Screen | New pet shows |
| --- | --- |
| Overview | Wellness score `—` / "No data yet", "No collar paired", "No insight yet" |
| Health | Empty trend charts, "Not enough history" baseline rows |
| Nutrition | "No data available", empty meal history |
| Litter | Not-applicable state (no paired tray) |

Archiving is non-destructive: the pet leaves the active list and the header
selector but keeps every record, and can be restored from **Archived pets**.
The last active pet cannot be archived.

## How the data flows

Only raw telemetry is stored: `PetVitals` (steps, rest, calorie target, water,
baselines), `DeviceStatus` (collar), `LitterDevice` (smart tray), and lists of
`MealEntry` and `LitterEvent` records, per pet. Everything on screen is derived
from those on each render:

| Derived value | Built by |
| --- | --- |
| Wellness score + pillar breakdown | `src/lib/healthScore.ts` |
| The four metric cards | `src/lib/metrics.ts` |
| The AI insight copy | `src/lib/insights.ts` |
| Chart series, weight trend, baseline bands | `src/lib/trends.ts` |
| Calorie totals, meal counts, nutrition status | `src/lib/nutrition.ts` |
| Tray visits, litter level, pattern band | `src/lib/litter.ts` |

Calories consumed and meal counts are **summed from the meal list**, and tray
visits from the **litter event list** — neither is stored. `withNutrition()` and
`litterTotals()` merge those totals onto raw vitals before the score layer sees
them, which is why logging one meal or recording one tray visit moves the
originating screen, the Overview metric card, the wellness score and the Health
baseline together.

Litter applicability is decided by whether a pet has a paired `LitterDevice`.
Buddy and Luna have none, so every litter surface shows a not-applicable state
instead of zeros, and the Litter screen hides its simulation controls entirely.

The trend charts hold the six days before today from `PetHistory`, then append
today's live value from `PetVitals` — which is why a simulation moves the last
point of every chart.

That is why a single simulated change ripples through the score, the trends,
the insight and the alerts without any of them being updated by hand.

### Demo simulations

Two buttons on the Overview page mutate the selected pet's raw telemetry. Both
are labelled as simulated in the UI, and neither is presented as hardware data.

- **Simulate live update** (Live monitoring card) — adds a random 120–480 step
  burst, sometimes a few minutes of rest, resets last-seen to "Just now",
  advances the activity state, drains 1% of battery and jitters heart rate and
  temperature on collars that support them. Appends a collar event to the
  timeline and shows a success toast.
- **Simulate health change** (AI Insight card) — drops steps to 45% and rest to
  78% of current, marks one scheduled meal as missed (which is what lowers the
  calorie total) and, for cats, adds three litter visits. Emits two or three
  unread alerts, a bell notification and two timeline events, then a warning
  toast.
- **Simulate missed meal** (Nutrition insight card) — marks the next pending
  meal as missed, or walks back the last one served. Adds a nutrition alert, a
  notification and a timeline event, then a warning toast. The calorie total,
  completion percentage, status pill and insight all follow from the meal list.
- **Simulate litter usage** (Litter summary card) — appends one tray visit with
  a random duration, deposit weight and usage type. Visit count, the 7-day
  chart, the baseline band and the wellness score all follow.
- **Simulate low litter** (Litter insight card) — drops the tray below its
  low-litter threshold and adds an alert, a notification and a timeline event.
- **Mark as cleaned** (Litter box card) — tops the tray to 100%, resets the
  last-cleaned time and clears the low-litter and cleaning-reminder alerts.

Because the score and insight are derived, both simulations immediately change
the wellness score, the trend arrows, the pillar bars and the insight rule that
fires. **Reset demo data** restores the pristine bootstrap snapshot; it appears
under the page heading and inside the AI Insight card once anything is modified.

Insight copy is rule-based and safety-bounded: observations only ("outside the
usual baseline"), soft next steps ("consider monitoring", "contact your
veterinarian if the change continues"), and never a diagnosis.

## Run it locally

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173.

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Type-check only |

## Project structure

```
src/
  components/
    layout/    AppShell, AppErrorBoundary, Sidebar, MobileNavigation,
               TopHeader, PageHeading
    header/    NotificationButton, ProfileButton
    pets/      PetSelector, PetCard, PetFormDialog (add + edit),
               PetProfileDialog
    overview/  PetSummaryCard (hero), LiveMonitoringCard, AiInsightCard,
               RecentAlertsCard, ActivityTimelineCard (+ TimelineList),
               QuickActionsCard, PetPickerDialog, CareHistoryDialog
    health/    ActivityTrendCard, RestTrendCard, NutritionHealthCard,
               WeightTrendCard, BaselineComparisonCard
    nutrition/ NutritionSummaryCard, MealHistoryCard, LogFoodDialog,
               FeedingScheduleCard, FoodPreferencesCard, NutritionInsightCard
    litter/    LitterSummaryCard, LitterHistoryCard, LitterDeviceCard,
               LitterInsightCard, LitterNotApplicableCard
    ui/        Card, SectionHeader, StatCard, HealthScoreCard, TrendChart,
               InsightPanel, FormField, ConfirmDialog, Avatar, Logo, Skeleton,
               EmptyState, Modal, ToastViewport
  config/      navigation.ts (single source of truth for nav), quickActions.ts
  context/     AppDataContext.tsx (pets, telemetry, simulations, alerts),
               ToastContext.tsx
  data/        mockData.ts — raw telemetry only, stands in for the API
  hooks/       useMediaQuery, useOnClickOutside
  lib/         api.ts (the only importer of mockData), healthScore.ts,
               metrics.ts, insights.ts, trends.ts, nutrition.ts, litter.ts,
               simulation.ts, utils.ts
  pages/       OverviewPage, HealthPage, NutritionPage, LitterPage,
               MyPetsPage, SocialPage, NotFoundPage
  types/       index.ts — shared domain types
```

### Swapping mock data for a real API

`src/lib/api.ts` is the only seam. Replace the body of `fetchBootstrap()` with
real `fetch` calls that return the same shapes and nothing else changes.

## Android packaging (later step)

The groundwork is already in place:

- `capacitor.config.ts` with `appId: com.atronz.pethealth` and `webDir: dist`
- `base: './'` for production builds, so assets resolve inside a WebView
- `HashRouter`, because a history router breaks when files are served from disk
- `env(safe-area-inset-*)` padding on the header and bottom nav
- `@capacitor/core`, `@capacitor/cli` and `@capacitor/android` installed

When we get there:

```bash
npx cap add android && npm run cap:sync && npm run cap:open
```

## Charts

`src/components/ui/TrendChart.tsx` is dependency-free inline SVG — no charting
library, nothing browser-only, and it works offline inside a WebView. The plot
uses a fixed `viewBox` stretched with `preserveAspectRatio="none"` so it fills
any card width, with `vector-effect="non-scaling-stroke"` keeping line weights
uniform. Axis labels and the current-value dot are plain HTML so they stay
legible at 320px, and every chart carries an `sr-only` caption listing each
day's value.

## Design tokens

Defined in `tailwind.config.js`:

- `cream-50…300` — warm off-white backgrounds
- `sage-50…900` — primary accent
- `charcoal-400…900` — text
- `clay`, `gold` — sparing accents for negative trends and highlights
- `shadow-card` / `shadow-pop` — soft elevation
