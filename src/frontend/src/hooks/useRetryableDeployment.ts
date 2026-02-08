import { useState, useCallback } from 'react';
import { retryWithBackoff } from '@/lib/retryWithBackoff';
import { saveDeploymentAttempt, getDeploymentAttempt, clearDeploymentAttempt } from '@/lib/deploymentAttempt';
import { createDeploymentDiagnostics, DeploymentDiagnostics } from '@/lib/deploymentDiagnostics';
import { toast } from 'sonner';

export type DeploymentStatus = 'idle' | 'running' | 'retrying' | 'succeeded' | 'failed';

export interface UseRetryableDeploymentResult {
  status: DeploymentStatus;
  diagnostics: DeploymentDiagnostics | null;
  currentAttempt: number;
  maxAttempts: number;
  deploy: () => Promise<void>;
  retry: () => Promise<void>;
  clear: () => void;
}

/**
 * Hook that manages retryable deployment with automatic retry logic.
 * This is a mock implementation - in a real app, this would call actual deployment APIs.
 */
export function useRetryableDeployment(): UseRetryableDeploymentResult {
  const [status, setStatus] = useState<DeploymentStatus>('idle');
  const [diagnostics, setDiagnostics] = useState<DeploymentDiagnostics | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const maxAttempts = 2;

  const performDeployment = useCallback(async () => {
    // Mock deployment function - replace with actual deployment logic
    // For demonstration, this simulates a deployment that might fail
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Simulate random failure for testing
        const shouldFail = Math.random() > 0.7;
        if (shouldFail) {
          reject(new Error('Deployment failed: Network timeout or service unavailable'));
        } else {
          resolve();
        }
      }, 1000);
    });
  }, []);

  const deploy = useCallback(async () => {
    setStatus('running');
    setDiagnostics(null);
    setCurrentAttempt(1);

    // Save attempt for retry
    saveDeploymentAttempt({
      timestamp: Date.now(),
      options: {},
    });

    const result = await retryWithBackoff(performDeployment, {
      maxAttempts,
      delayMs: 2000,
      onRetry: (attempt, error) => {
        setStatus('retrying');
        setCurrentAttempt(attempt + 1);
        console.log(`Retrying deployment (attempt ${attempt + 1}/${maxAttempts})...`, error);
      },
    });

    if (result.success) {
      setStatus('succeeded');
      setDiagnostics(null);
      setCurrentAttempt(0);
      clearDeploymentAttempt();
    } else {
      setStatus('failed');
      const diag = createDeploymentDiagnostics(result.error);
      setDiagnostics(diag);
      setCurrentAttempt(0);
    }
  }, [performDeployment, maxAttempts]);

  const retry = useCallback(async () => {
    const lastAttempt = getDeploymentAttempt();
    if (!lastAttempt) {
      toast.error('Cannot retry deployment', {
        description: 'No previous deployment attempt found. Please start a new deployment.',
      });
      return;
    }

    // Immediately transition to running state
    setStatus('running');
    setDiagnostics(null);
    setCurrentAttempt(1);

    const result = await retryWithBackoff(performDeployment, {
      maxAttempts,
      delayMs: 2000,
      onRetry: (attempt, error) => {
        setStatus('retrying');
        setCurrentAttempt(attempt + 1);
        console.log(`Retrying deployment (attempt ${attempt + 1}/${maxAttempts})...`, error);
      },
    });

    if (result.success) {
      setStatus('succeeded');
      setDiagnostics(null);
      setCurrentAttempt(0);
      clearDeploymentAttempt();
    } else {
      setStatus('failed');
      const diag = createDeploymentDiagnostics(result.error);
      setDiagnostics(diag);
      setCurrentAttempt(0);
    }
  }, [performDeployment, maxAttempts]);

  const clear = useCallback(() => {
    setStatus('idle');
    setDiagnostics(null);
    setCurrentAttempt(0);
    clearDeploymentAttempt();
  }, []);

  return {
    status,
    diagnostics,
    currentAttempt,
    maxAttempts,
    deploy,
    retry,
    clear,
  };
}
