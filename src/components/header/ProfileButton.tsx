import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, PawPrint, Settings, UserRound } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppData } from '@/context/AppDataContext';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { cn } from '@/lib/utils';

/** Avatar button in the top header plus the account panel it opens. */
export function ProfileButton({ className }: { className?: string }) {
  const { user, pets, status } = useAppData();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setNotice(null);
  }, []);
  useOnClickOutside(containerRef, close, open);

  if (status === 'loading' || !user) {
    return <Skeleton className={cn('h-10 w-10 rounded-full', className)} />;
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Account menu"
        className="rounded-full ring-1 ring-cream-300 transition hover:ring-sage-200"
      >
        <Avatar name={user.name} src={user.avatarUrl} size="md" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Account"
          className="absolute right-0 z-40 mt-2 w-[min(17rem,calc(100vw-2rem))] animate-fade-in overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-pop"
        >
          <div className="flex items-center gap-3 border-b border-cream-200 px-4 py-3.5">
            <Avatar name={user.name} src={user.avatarUrl} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-charcoal-800">
                {user.name}
              </p>
              <p className="truncate text-xs text-charcoal-500">{user.email}</p>
              <p className="mt-1 inline-flex rounded-full bg-sage-50 px-2 py-0.5 text-[11px] font-medium text-sage-700">
                {user.plan}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-b border-cream-200 px-4 py-3 text-center">
            <div className="rounded-xl bg-cream-50 py-2">
              <p className="text-lg font-semibold text-charcoal-800">
                {pets.length}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-charcoal-400">
                Pets
              </p>
            </div>
            <div className="rounded-xl bg-cream-50 py-2">
              <p className="text-lg font-semibold text-charcoal-800">2024</p>
              <p className="text-[11px] uppercase tracking-wide text-charcoal-400">
                Since
              </p>
            </div>
          </div>

          <div className="p-1.5">
            <MenuItem
              icon={PawPrint}
              label="Manage pets"
              onClick={() => {
                close();
                navigate('/pets');
              }}
            />
            <MenuItem
              icon={Settings}
              label="Account settings"
              onClick={() => setNotice('Account settings are not available in this preview.')}
            />
            <MenuItem
              icon={LogOut}
              label="Sign out"
              onClick={() => setNotice('Sign out is not available in this preview.')}
            />
          </div>

          {notice ? (
            <p className="border-t border-cream-200 bg-cream-50 px-4 py-2.5 text-xs text-charcoal-500">
              {notice}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof UserRound;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm text-charcoal-700 transition hover:bg-cream-100"
    >
      <Icon className="h-4 w-4 text-charcoal-400" aria-hidden="true" />
      {label}
    </button>
  );
}
