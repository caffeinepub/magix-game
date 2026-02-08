const STORAGE_KEY_PREFIX = 'build-event-choice';

export interface BuildChoice {
  eventId: string;
  communityName: string;
  wantsToBuild: boolean;
  timestamp: number;
}

export function saveBuildChoice(communityName: string, eventId: string, wantsToBuild: boolean): void {
  const choice: BuildChoice = {
    eventId,
    communityName,
    wantsToBuild,
    timestamp: Date.now(),
  };
  const key = `${STORAGE_KEY_PREFIX}-${communityName}`;
  try {
    sessionStorage.setItem(key, JSON.stringify(choice));
  } catch (error) {
    console.error('Failed to save build choice:', error);
  }
}

export function getBuildChoice(communityName: string, eventId: string): BuildChoice | null {
  const key = `${STORAGE_KEY_PREFIX}-${communityName}`;
  try {
    const stored = sessionStorage.getItem(key);
    if (!stored) return null;
    
    const choice: BuildChoice = JSON.parse(stored);
    
    // Only return if it matches the current event
    if (choice.eventId === eventId) {
      return choice;
    }
    
    // Clear stale choice for different event
    sessionStorage.removeItem(key);
    return null;
  } catch (error) {
    console.error('Failed to read build choice:', error);
    return null;
  }
}

export function clearBuildChoice(communityName: string): void {
  const key = `${STORAGE_KEY_PREFIX}-${communityName}`;
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear build choice:', error);
  }
}
