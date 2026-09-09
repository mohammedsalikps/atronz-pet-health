import { useId } from 'react';
import { cn } from '@/lib/utils';
import type { SeriesPoint } from '@/types';

export interface TrendChartProps {
  points: SeriesPoint[];
  variant?: 'area' | 'bar';
  /** Optional horizontal reference line, e.g. the pet's usual value. */
  baseline?: number | null;
  baselineLabel?: string;
  formatValue: (value: number) => string;
  /** Sentence describing the chart for screen readers. */
  ariaLabel: string;
  className?: string;
}

const VIEW_W = 600;
const VIEW_H = 160;
const PAD_TOP = 14;
const PAD_BOTTOM = 14;

/**
 * Dependency-free SVG trend chart.
 *
 * The plot is drawn in a fixed viewBox stretched with
 * `preserveAspectRatio="none"`, so it fills any card width; strokes stay
 * uniform via `vector-effect="non-scaling-stroke"`. Axis labels and the
 * current-value marker are plain HTML, so they never scale with the plot and
 * stay legible at 320px.
 */
export function TrendChart({
  points,
  variant = 'area',
  baseline = null,
  baselineLabel,
  formatValue,
  ariaLabel,
  className,
}: TrendChartProps) {
  const gradientId = useId();

  if (points.length === 0) return null;

  const values = points.map((point) => point.value);
  const candidates = baseline === null ? values : [...values, baseline];
  const rawMax = Math.max(...candidates);
  const rawMin = variant === 'bar' ? 0 : Math.min(...candidates);
  // Guard against a flat series collapsing the domain to zero height.
  const span = rawMax - rawMin || Math.max(rawMax, 1);
  const max = rawMax + span * 0.12;
  const min = variant === 'bar' ? 0 : Math.max(0, rawMin - span * 0.12);

  const norm = (value: number) => (max === min ? 0.5 : 1 - (value - min) / (max - min));
  const plotY = (value: number) =>
    PAD_TOP + norm(value) * (VIEW_H - PAD_TOP - PAD_BOTTOM);
  const topPercent = (value: number) => (plotY(value) / VIEW_H) * 100;

  const stepX = points.length > 1 ? VIEW_W / (points.length - 1) : 0;
  const areaX = (index: number) =>
    points.length > 1 ? index * stepX : VIEW_W / 2;
  const bandWidth = VIEW_W / points.length;
  const barX = (index: number) => index * bandWidth + bandWidth * 0.5;

  const pointX = variant === 'bar' ? barX : areaX;
  const leftPercent = (index: number) => (pointX(index) / VIEW_W) * 100;

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${pointX(index)},${plotY(point.value)}`)
    .join(' ');
  const areaPath = `${linePath} L${pointX(points.length - 1)},${VIEW_H} L${pointX(0)},${VIEW_H} Z`;

  const current = points[points.length - 1];
  const currentIndex = points.length - 1;

  const baselineLine =
    baseline === null ? null : (
      <line
        x1="0"
        x2={VIEW_W}
        y1={plotY(baseline)}
        y2={plotY(baseline)}
        stroke="#55755F"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        strokeOpacity="0.55"
        vectorEffect="non-scaling-stroke"
      />
    );

  return (
    <figure className={cn('m-0', className)}>
      <div className="relative">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={ariaLabel}
          className="h-28 w-full overflow-visible sm:h-36"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6B9077" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#6B9077" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Behind the area fill, but drawn again above the bars below so it
              is never hidden by them. */}
          {baseline !== null && variant === 'area' ? baselineLine : null}

          {variant === 'bar'
            ? points.map((point, index) => {
                const y = plotY(point.value);
                return (
                  <rect
                    key={point.label + index}
                    x={index * bandWidth + bandWidth * 0.22}
                    y={y}
                    width={bandWidth * 0.56}
                    height={Math.max(2, VIEW_H - y)}
                    rx="6"
                    fill={point.isCurrent ? '#55755F' : '#C6D8CB'}
                  />
                );
              })
            : (
              <>
                <path d={areaPath} fill={`url(#${gradientId})`} />
                <path
                  d={linePath}
                  fill="none"
                  stroke="#55755F"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}

          {baseline !== null && variant === 'bar' ? baselineLine : null}
        </svg>

        {/* Current-value marker, in HTML so it stays a circle at any width. */}
        {variant === 'area' ? (
          <span
            className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sage-700 shadow-sm"
            style={{
              left: `${leftPercent(currentIndex)}%`,
              top: `${topPercent(current.value)}%`,
            }}
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between gap-1">
        {points.map((point, index) => (
          <span
            key={point.label + index}
            className={cn(
              'min-w-0 flex-1 truncate text-center text-[10px] sm:text-[11px]',
              point.isCurrent
                ? 'font-semibold text-charcoal-700'
                : 'text-charcoal-400',
            )}
          >
            {point.label}
          </span>
        ))}
      </div>

      {/* Screen-reader table: the shape of the chart in words. */}
      <figcaption className="sr-only">
        {ariaLabel}
        {baseline !== null && baselineLabel
          ? ` ${baselineLabel}: ${formatValue(baseline)}.`
          : ''}
        {points
          .map((point) => ` ${point.label}: ${formatValue(point.value)}.`)
          .join('')}
      </figcaption>
    </figure>
  );
}
