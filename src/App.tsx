import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppErrorBoundary } from '@/components/layout/AppErrorBoundary';
import { AppShell } from '@/components/layout/AppShell';
import { ToastViewport } from '@/components/ui/ToastViewport';
import { AppDataProvider } from '@/context/AppDataContext';
import { ToastProvider } from '@/context/ToastContext';
import { HealthPage } from '@/pages/HealthPage';
import { LitterPage } from '@/pages/LitterPage';
import { MyPetsPage } from '@/pages/MyPetsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { NutritionPage } from '@/pages/NutritionPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { SocialPage } from '@/pages/SocialPage';

/**
 * `HashRouter` is deliberate: Capacitor serves the built app from the
 * filesystem, where a history-based router breaks on reload and deep links.
 */
export default function App() {
  return (
    <AppErrorBoundary>
      <AppDataProvider>
        <ToastProvider>
          <HashRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/health" element={<HealthPage />} />
                <Route path="/nutrition" element={<NutritionPage />} />
                <Route path="/litter" element={<LitterPage />} />
                <Route path="/pets" element={<MyPetsPage />} />
                <Route path="/social" element={<SocialPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </HashRouter>
          <ToastViewport />
        </ToastProvider>
      </AppDataProvider>
    </AppErrorBoundary>
  );
}
