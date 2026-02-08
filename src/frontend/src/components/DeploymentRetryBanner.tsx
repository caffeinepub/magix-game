import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, X, Info } from 'lucide-react';
import { DeploymentDiagnostics } from '@/lib/deploymentDiagnostics';
import { DeploymentFailureDetailsDialog } from './DeploymentFailureDetailsDialog';

interface DeploymentRetryBannerProps {
  diagnostics: DeploymentDiagnostics;
  onRetry: () => void;
  onDismiss: () => void;
  isRetrying?: boolean;
  currentAttempt?: number;
  maxAttempts?: number;
}

export function DeploymentRetryBanner({
  diagnostics,
  onRetry,
  onDismiss,
  isRetrying = false,
  currentAttempt = 0,
  maxAttempts = 2,
}: DeploymentRetryBannerProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          <span>Deployment Failed</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mr-2"
            onClick={onDismiss}
            disabled={isRetrying}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p className="text-sm">{diagnostics.summary}</p>
          
          {isRetrying && currentAttempt > 0 && (
            <p className="text-sm font-medium">
              Retrying... (attempt {currentAttempt}/{maxAttempts})
            </p>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              size="sm"
              variant="outline"
              className="bg-white dark:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry Deployment'}
            </Button>
            <Button
              onClick={() => setShowDetails(true)}
              disabled={isRetrying}
              size="sm"
              variant="outline"
              className="bg-white dark:bg-slate-800"
            >
              <Info className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <DeploymentFailureDetailsDialog
        open={showDetails}
        onOpenChange={setShowDetails}
        diagnostics={diagnostics}
      />
    </>
  );
}
