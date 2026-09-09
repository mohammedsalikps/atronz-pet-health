import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

/** Fallback route so a bad deep link inside the Android WebView never dead-ends. */
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Card className="mx-auto max-w-2xl">
      <EmptyState
        icon={Compass}
        title="That page does not exist"
        description="The screen you tried to open is not part of Atronz yet."
        actionLabel="Go to Overview"
        onAction={() => navigate('/overview')}
        className="border-0 bg-transparent"
      />
    </Card>
  );
}
