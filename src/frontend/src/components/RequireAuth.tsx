import { ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface RequireAuthProps {
  children: ReactNode;
  message?: string;
}

export function RequireAuth({ children, message = 'You need to sign in to access this feature.' }: RequireAuthProps) {
  const { identity, login, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return null;
  }

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  if (!isAuthenticated) {
    return (
      <Alert className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
        <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-900 dark:text-amber-100">Authentication Required</AlertTitle>
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          {message}
          <Button onClick={login} className="mt-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
            Sign In Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
