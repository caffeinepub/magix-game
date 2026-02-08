/**
 * Client-side persistence helper for deployment attempt state.
 * Uses sessionStorage to record the last build+deployment attempt
 * so the UI can retry without reconfiguration.
 */

export interface DeploymentAttemptData {
  timestamp: number;
  options?: Record<string, unknown>;
}

const STORAGE_KEY = 'deployment_attempt';

export function saveDeploymentAttempt(data: DeploymentAttemptData): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save deployment attempt:', error);
  }
}

export function getDeploymentAttempt(): DeploymentAttemptData | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as DeploymentAttemptData;
  } catch (error) {
    console.warn('Failed to read deployment attempt:', error);
    return null;
  }
}

export function clearDeploymentAttempt(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear deployment attempt:', error);
  }
}
