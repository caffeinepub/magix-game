import { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActiveEvent, useUserEligibility } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { AvatarMarker } from '../components/AvatarMarker';
import { ConstructionOverlay } from '../components/ConstructionOverlay';
import { AddMyPartButton } from '../components/AddMyPartButton';
import { BuildChoicePrompt } from '../components/BuildChoicePrompt';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Map as MapIcon, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { saveBuildChoice, getBuildChoice } from '../lib/buildEventChoice';
import { getErrorMessage } from '../lib/errorMessage';
import type { Principal } from '@icp-sdk/core/principal';
import type { Position, UserProfile } from '../backend';

export function MapGamePage() {
  const { name } = useParams({ from: '/community/$name/map' });
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();
  const currentPrincipal = identity?.getPrincipal();
  const currentPrincipalStr = currentPrincipal?.toString();

  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubmittingChoice, setIsSubmittingChoice] = useState(false);
  const [localChoice, setLocalChoice] = useState<boolean | null>(null);

  const { data: activeEvent, isLoading: eventLoading } = useActiveEvent(name);
  const isEventActive = activeEvent?.isActive ?? false;
  const eventId = activeEvent?.id;

  const {
    data: mapData = [],
    isLoading: mapLoading,
    refetch: refetchMap,
  } = useQuery({
    queryKey: ['community-map', name],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommunityMap(name);
    },
    enabled: !!actor,
    refetchInterval: 3000,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['community-members', name],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCommunityMembers(name);
    },
    enabled: !!actor,
    refetchInterval: 3000,
  });

  const { data: profiles = globalThis.Map ? new globalThis.Map<string, UserProfile>() : new window.Map<string, UserProfile>() } = useQuery({
    queryKey: ['member-profiles-map', name, members],
    queryFn: async () => {
      if (!actor || members.length === 0) return new window.Map<string, UserProfile>();
      const profileMap = new window.Map<string, UserProfile>();
      await Promise.all(
        members.map(async (principal: Principal) => {
          try {
            const profile = await actor.getProfile(principal);
            profileMap.set(principal.toString(), profile);
          } catch {
            // Profile doesn't exist
          }
        })
      );
      return profileMap;
    },
    enabled: !!actor && members.length > 0,
  });

  const {
    data: activeParts = [],
    isLoading: constructionLoading,
    refetch: refetchConstruction,
  } = useQuery({
    queryKey: ['active-construction', eventId],
    queryFn: async () => {
      if (!actor || !eventId) return [];
      const result = await actor.getActiveConstruction(eventId);
      return result || [];
    },
    enabled: !!actor && !!eventId,
    refetchInterval: 3000,
  });

  const { data: completedBuildings = [] } = useQuery({
    queryKey: ['completed-constructions', name],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompletedConstructions(name);
    },
    enabled: !!actor,
    refetchInterval: 3000,
  });

  const {
    data: isEligible = false,
    refetch: refetchEligibility,
  } = useUserEligibility(eventId, currentPrincipal);

  const isMember = Boolean(currentPrincipalStr && members.some((p: Principal) => p.toString() === currentPrincipalStr));

  // Check local storage for existing choice when event changes
  useEffect(() => {
    if (eventId && isAuthenticated && isMember) {
      const storedChoice = getBuildChoice(name, eventId);
      if (storedChoice) {
        setLocalChoice(storedChoice.wantsToBuild);
        setShowPrompt(false);
      } else {
        setLocalChoice(null);
        setShowPrompt(true);
      }
    } else {
      setLocalChoice(null);
      setShowPrompt(false);
    }
  }, [eventId, name, isAuthenticated, isMember]);

  const handleChoice = async (wantsToBuild: boolean) => {
    if (!actor || !eventId || !currentPrincipal) return;

    setIsSubmittingChoice(true);
    try {
      await actor.setBuildEligibility(eventId, currentPrincipal, wantsToBuild);
      saveBuildChoice(name, eventId, wantsToBuild);
      setLocalChoice(wantsToBuild);
      setShowPrompt(false);
      refetchEligibility();
      toast.success(wantsToBuild ? 'You can now build!' : 'Choice saved. You will not build in this event.');
    } catch (error) {
      console.error('Failed to set build eligibility:', error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmittingChoice(false);
    }
  };

  const handleContributionSuccess = () => {
    refetchMap();
    refetchConstruction();
    refetchEligibility();
  };

  if (mapLoading || constructionLoading || eventLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!isMember && isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
          <MapIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-900 dark:text-amber-100">Join Community First</AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            You need to join this community before you can view the map and participate in building.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showPrompt && isEventActive && isAuthenticated && isMember && (
        <BuildChoicePrompt
          onYes={() => handleChoice(true)}
          onNo={() => handleChoice(false)}
          isSubmitting={isSubmittingChoice}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">
            {name} - Community Map
          </h1>
          <p className="text-muted-foreground mt-1">Build together, one part at a time</p>
        </div>
        <AddMyPartButton
          communityName={name}
          isMember={isMember}
          eventId={eventId ?? null}
          isEventActive={isEventActive}
          userChoice={localChoice}
          isEligible={isEligible}
          onSuccess={handleContributionSuccess}
        />
      </div>

      {!isEventActive && (
        <Alert className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
          <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-900 dark:text-amber-100">No Active Event</AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Building is unavailable until an admin starts an event. The map and member avatars remain visible.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-amber-200 dark:border-amber-800 shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <img
              src="/assets/generated/village-map.dim_1600x900.png"
              alt="Community Map"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {mapData.map(([principal, position]: [Principal, Position]) => {
              const principalStr = principal.toString();
              const profile = profiles.get(principalStr);
              return (
                <AvatarMarker
                  key={principalStr}
                  displayName={profile?.displayName}
                  principal={principalStr}
                  x={position.x}
                  y={position.y}
                />
              );
            })}

            {isEventActive && eventId && (
              <div
                className="absolute w-8 h-8 bg-amber-500 border-4 border-white dark:border-slate-900 rounded-full shadow-lg animate-pulse"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                title="Building Site"
              />
            )}

            {isEventActive && (
              <ConstructionOverlay
                activeParts={activeParts}
                targetParts={members.length}
                completedBuildings={completedBuildings}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
