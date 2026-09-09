import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BellRing, Users } from 'lucide-react';
import { PageHeading } from '@/components/layout/PageHeading';
import { Card } from '@/components/ui/Card';

/**
 * The Social redirect target. Atronz Social ships as a separate app, so this
 * screen holds a clear "coming soon" state instead of a broken link.
 */
export function SocialPage() {
  const navigate = useNavigate();
  const [notified, setNotified] = useState(false);

  return (
    <div>
      <PageHeading
        eyebrow="Atronz Social"
        title="Social app coming soon"
        description="A community space for Atronz owners, launching after the health app."
      />

      <Card className="mx-auto max-w-2xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-50 text-sage-600">
          <Users className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-charcoal-900">
          We are still building this
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-charcoal-500">
          Atronz Social will let you share milestones, compare healthy routines
          and find nearby vets and groomers other owners trust.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => setNotified(true)}
            disabled={notified}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sage-700 disabled:cursor-default disabled:bg-sage-300 sm:w-auto"
          >
            <BellRing className="h-4 w-4" aria-hidden="true" />
            {notified ? 'You are on the list' : 'Notify me at launch'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/overview')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-cream-300 bg-white px-4 py-2.5 text-sm font-medium text-charcoal-600 transition hover:border-sage-200 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Overview
          </button>
        </div>

        {notified ? (
          <p role="status" className="mt-4 text-xs text-sage-700">
            Thanks — we will email you the moment Atronz Social opens up.
          </p>
        ) : null}
      </Card>
    </div>
  );
}
