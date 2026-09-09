import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { NotificationButton } from '@/components/header/NotificationButton';
import { ProfileButton } from '@/components/header/ProfileButton';
import { PetSelector } from '@/components/pets/PetSelector';
import { Logo } from '@/components/ui/Logo';
import { NAV_ITEMS, SOCIAL_ROUTE } from '@/config/navigation';

export interface TopHeaderProps {
  onOpenMenu: () => void;
}

function useCurrentSectionLabel(): string {
  const { pathname } = useLocation();
  if (pathname.startsWith(SOCIAL_ROUTE)) return 'Atronz Social';
  const match = NAV_ITEMS.find((item) => pathname.startsWith(item.to));
  return match?.label ?? 'Atronz';
}

/**
 * Sticky header inside the main content column.
 *
 * Below `lg` the pet selector drops to its own full-width row: five 40px
 * controls plus a selector do not fit on one line at 320px.
 */
export function TopHeader({ onOpenMenu }: TopHeaderProps) {
  const sectionLabel = useCurrentSectionLabel();

  return (
    <header className="safe-top sticky top-0 z-30 border-b border-cream-300 bg-cream-100/90 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream-300 bg-white text-charcoal-600 shadow-sm transition hover:border-sage-200 lg:hidden"
          >
            <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>

          {/* Compact brand on mobile, section title on desktop. */}
          <Logo showWordmark={false} className="lg:hidden" />
          <h1 className="hidden min-w-0 truncate text-lg font-semibold tracking-tight text-charcoal-900 lg:block">
            {sectionLabel}
          </h1>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <PetSelector className="hidden w-56 lg:block" />
            <NotificationButton />
            <ProfileButton />
          </div>
        </div>

        <PetSelector className="mt-2.5 lg:hidden" />
      </div>
    </header>
  );
}
