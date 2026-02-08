import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { AuthStatus } from './AuthStatus';
import { Sparkles, Users } from 'lucide-react';
import { useRetryableDeployment } from '@/hooks/useRetryableDeployment';
import { DeploymentRetryBanner } from './DeploymentRetryBanner';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { status, diagnostics, currentAttempt, maxAttempts, retry, clear } = useRetryableDeployment();

  const showRetryBanner = status === 'failed' && diagnostics !== null;
  const isRetrying = status === 'retrying' || status === 'running';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <header className="border-b border-amber-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 hover:opacity-80 transition-opacity"
            >
              <Sparkles className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              Magix Game
            </button>
            <nav className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/communities' })}
                className="text-amber-900 dark:text-amber-100"
              >
                <Users className="w-4 h-4 mr-2" />
                Communities
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/profile' })}
                className="text-amber-900 dark:text-amber-100"
              >
                My Profile
              </Button>
            </nav>
          </div>
          <AuthStatus />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {showRetryBanner && (
          <DeploymentRetryBanner
            diagnostics={diagnostics}
            onRetry={retry}
            onDismiss={clear}
            isRetrying={isRetrying}
            currentAttempt={currentAttempt}
            maxAttempts={maxAttempts}
          />
        )}
        {children}
      </main>

      <footer className="border-t border-amber-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            This app is supported by{' '}
            <a
              href="https://www.dmc-technologies.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-orange-600 dark:hover:text-orange-400 transition-colors underline"
            >
              DMC Technologies
            </a>{' '}
            and by{' '}
            <a
              href="https://www.ngenvironnement.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-orange-600 dark:hover:text-orange-400 transition-colors underline"
            >
              Nouvelle Gestion Environnement
            </a>
            , a French NGO.
          </p>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            © 2026. Built with ❤️ using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-orange-600 dark:hover:text-orange-400 transition-colors underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
