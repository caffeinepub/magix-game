/**
 * Generic async retry helper that performs automatic retries
 * with short backoff delay for transient failures.
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  onRetry?: (attempt: number, error: unknown) => void;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: unknown;
  attempts: number;
  attemptErrors: unknown[];
}

/**
 * Executes an async function with automatic retry on failure.
 * Returns the final result or throws the last error.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const { maxAttempts = 2, delayMs = 2000, onRetry } = options;
  const attemptErrors: unknown[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      return {
        success: true,
        result,
        attempts: attempt,
        attemptErrors,
      };
    } catch (error) {
      attemptErrors.push(error);

      if (attempt < maxAttempts) {
        // Not the last attempt, retry after delay
        if (onRetry) {
          onRetry(attempt, error);
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        // Last attempt failed
        return {
          success: false,
          error,
          attempts: attempt,
          attemptErrors,
        };
      }
    }
  }

  // Should never reach here, but TypeScript needs it
  throw new Error('Retry logic error');
}
