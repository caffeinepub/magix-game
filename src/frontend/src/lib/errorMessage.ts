/**
 * Extracts a user-friendly error message from an unknown error value.
 * Preserves backend-provided messages (e.g., authorization traps) when available.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
}

/**
 * Checks if an error message indicates an authorization failure.
 */
export function isAuthorizationError(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('only admins') ||
    lowerMessage.includes('admin-only') ||
    lowerMessage.includes('permission denied')
  );
}

/**
 * Extracts a concise summary from an error for display purposes.
 */
export function getErrorSummary(error: unknown): string {
  const message = getErrorMessage(error);
  // Truncate very long messages for summary display
  if (message.length > 200) {
    return message.substring(0, 197) + '...';
  }
  return message;
}

/**
 * Extracts full raw error details for debugging.
 */
export function getErrorDetails(error: unknown): string {
  if (error instanceof Error) {
    return `${error.message}\n\nStack:\n${error.stack || 'No stack trace'}`;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return String(error);
    }
  }
  return String(error);
}
