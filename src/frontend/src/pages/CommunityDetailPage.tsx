import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCommunityMembers, useCommunityScopedUserProfiles } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CommunityMemberProfileDialog } from '../components/CommunityMemberProfileDialog';
import { toast } from 'sonner';
import { Users, UserPlus, Loader2, Map as MapIcon, ArrowRight, UserCircle } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

export function CommunityDetailPage() {
  const { name } = useParams({ from: '/community/$name' });
  const navigate = useNavigate();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [selectedMember, setSelectedMember] = useState<Principal | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();
  const currentPrincipal = identity?.getPrincipal().toString();

  const { data: members = [], isLoading: membersLoading } = useCommunityMembers(name);

  const { data: communityScopedProfiles = new window.Map(), isLoading: profilesLoading } = useCommunityScopedUserProfiles(name, members);

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.joinCommunity(name);
    },
    onSuccess: () => {
      toast.success('Successfully joined the community!');
      queryClient.invalidateQueries({ queryKey: ['community-members', name] });
    },
    onError: (error) => {
      console.error('Join error:', error);
      if (error instanceof Error && error.message.includes('Already a member')) {
        toast.info('You are already a member of this community');
      } else {
        toast.error('Failed to join community');
      }
    },
  });

  const handleJoin = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to join a community');
      return;
    }
    joinMutation.mutate();
  };

  const handleViewProfile = (principal: Principal) => {
    setSelectedMember(principal);
    setProfileDialogOpen(true);
  };

  const isMember = currentPrincipal && members.some((p: Principal) => p.toString() === currentPrincipal);

  const selectedProfile = selectedMember
    ? communityScopedProfiles.get(selectedMember.toString()) || null
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-amber-200 dark:border-amber-800 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl text-amber-900 dark:text-amber-100">{name}</CardTitle>
              <Badge variant="secondary" className="mt-2">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </Badge>
            </div>
            <div className="flex gap-2">
              {!isMember && isAuthenticated && (
                <Button
                  onClick={handleJoin}
                  disabled={joinMutation.isPending}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  {joinMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Community
                    </>
                  )}
                </Button>
              )}
              {isMember && (
                <Button
                  onClick={() => navigate({ to: '/community/$name/map', params: { name } })}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  <MapIcon className="w-4 h-4 mr-2" />
                  Open Map
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <Users className="w-5 h-5" />
            Community Members
          </h3>
          {membersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((principal: Principal, index: number) => {
                const principalStr = principal.toString();
                const profile = communityScopedProfiles.get(principalStr);
                const isCurrentUser = principalStr === currentPrincipal;
                return (
                  <div key={principalStr}>
                    {index > 0 && <Separator className="my-2" />}
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-amber-900 dark:text-amber-100">
                            {profile?.name || 'Anonymous User'}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-mono text-muted-foreground">{principalStr}</p>
                      </div>
                      {isMember && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProfile(principal)}
                          className="text-amber-600 dark:text-amber-400 hover:text-orange-600 dark:hover:text-orange-400"
                        >
                          <UserCircle className="w-4 h-4 mr-2" />
                          {isCurrentUser ? 'My Profile' : 'View Profile'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMember && (
        <CommunityMemberProfileDialog
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
          communityName={name}
          memberPrincipal={selectedMember}
          profile={selectedProfile}
          isLoading={profilesLoading}
        />
      )}
    </div>
  );
}
