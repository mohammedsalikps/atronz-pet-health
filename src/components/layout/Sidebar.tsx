import { NavLink } from 'react-router-dom';
import { ArrowUpRight, Users } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { NAV_ITEMS, SOCIAL_ROUTE } from '@/config/navigation';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  /** Called after a nav item is chosen — used to close the mobile drawer. */
  onNavigate?: () => void;
  className?: string;
}

/**
 * Primary navigation column. Rendered fixed on desktop and reused verbatim
 * inside the mobile drawer, so there is only one nav implementation.
 */
export function Sidebar({ onNavigate, className }: SidebarProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col border-r border-cream-300 bg-cream-50',
        className,
      )}
    >
      <div className="px-5 pb-4 pt-5">
        <Logo showProductName />
      </div>

      <nav
        aria-label="Primary"
        className="app-scrollbar flex-1 overflow-y-auto px-3 py-2"
      >
        <p className="px-2.5 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-charcoal-400">
          Monitoring
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-white text-charcoal-900 shadow-card ring-1 ring-cream-300'
                      : 'text-charcoal-500 hover:bg-white/70 hover:text-charcoal-800',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg transition',
                        isActive
                          ? 'bg-sage-600 text-white'
                          : 'bg-cream-200 text-charcoal-500 group-hover:bg-sage-50 group-hover:text-sage-600',
                      )}
                    >
                      <item.icon
                        className="h-[17px] w-[17px]"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-cream-300 p-3">
        <NavLink
          to={SOCIAL_ROUTE}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-start gap-3 rounded-xl border p-3 transition',
              isActive
                ? 'border-sage-200 bg-sage-50'
                : 'border-cream-300 bg-white hover:border-sage-200 hover:bg-sage-50/60',
            )
          }
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sage-100 text-sage-700">
            <Users className="h-[17px] w-[17px]" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-sm font-medium text-charcoal-800">
              Atronz Social
              <ArrowUpRight
                className="h-3.5 w-3.5 text-charcoal-400"
                aria-hidden="true"
              />
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-charcoal-500">
              The community app for pet owners
            </span>
          </span>
        </NavLink>
      </div>
    </div>
  );
}
