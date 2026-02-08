import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@icp-sdk/core/principal';
import type { CommunityScopedUserProfile, PersistentEventView } from '../backend';

export function useProfile(principal: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['profile', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useCommunities() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCommunities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCommunityMembers(communityName: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['community-members', communityName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCommunityMembers(communityName);
    },
    enabled: !!actor && !isFetching && !!communityName,
  });
}

export function useCommunityMap(communityName: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['community-map', communityName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommunityMap(communityName);
    },
    enabled: !!actor && !isFetching && !!communityName,
    refetchInterval: 3000,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useCommunityScopedUserProfile(communityName: string, userPrincipal: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<CommunityScopedUserProfile | null>({
    queryKey: ['community-scoped-profile', communityName, userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      return actor.getCommunityScopedUserProfile(communityName, userPrincipal);
    },
    enabled: !!actor && !isFetching && !!communityName && !!userPrincipal,
    retry: false,
  });
}

export function useCommunityScopedUserProfiles(communityName: string, members: Principal[]) {
  const { actor, isFetching } = useActor();

  return useQuery<Map<string, CommunityScopedUserProfile>>({
    queryKey: ['community-scoped-profiles', communityName, members.map(m => m.toString()).join(',')],
    queryFn: async () => {
      if (!actor || members.length === 0) return new window.Map<string, CommunityScopedUserProfile>();
      const profileMap = new window.Map<string, CommunityScopedUserProfile>();
      await Promise.all(
        members.map(async (principal: Principal) => {
          try {
            const profile = await actor.getCommunityScopedUserProfile(communityName, principal);
            if (profile) {
              profileMap.set(principal.toString(), profile);
            }
          } catch {
            // Profile doesn't exist or access denied
          }
        })
      );
      return profileMap;
    },
    enabled: !!actor && !isFetching && !!communityName && members.length > 0,
  });
}

export function useActiveEvent(communityName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PersistentEventView | null>({
    queryKey: ['active-event', communityName],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPersistentActiveEvent(communityName);
    },
    enabled: !!actor && !isFetching && !!communityName,
    refetchInterval: 3000,
  });
}

export function useUserEligibility(eventId: string | undefined, userPrincipal: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['user-eligibility', eventId, userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !eventId || !userPrincipal) return false;
      return actor.isUserEligibleForEvent(eventId, userPrincipal);
    },
    enabled: !!actor && !isFetching && !!eventId && !!userPrincipal,
    retry: false,
  });
}
