import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, User, Briefcase, Activity, Link as LinkIcon, X, Plus } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';
import type { CommunityScopedUserProfile } from '../backend';
import { getErrorMessage } from '../lib/errorMessage';

interface CommunityMemberProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityName: string;
  memberPrincipal: Principal;
  profile: CommunityScopedUserProfile | null;
  isLoading: boolean;
}

export function CommunityMemberProfileDialog({
  open,
  onOpenChange,
  communityName,
  memberPrincipal,
  profile,
  isLoading,
}: CommunityMemberProfileDialogProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const currentPrincipal = identity?.getPrincipal().toString();
  const isOwnProfile = currentPrincipal === memberPrincipal.toString();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [socialNetworkLinks, setSocialNetworkLinks] = useState<string[]>([]);

  const [newService, setNewService] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setServices(profile.services);
      setActivities(profile.activities);
      setSocialNetworkLinks(profile.socialNetworkLinks);
    } else if (isOwnProfile) {
      setName('');
      setServices([]);
      setActivities([]);
      setSocialNetworkLinks([]);
    }
  }, [profile, isOwnProfile]);

  const saveMutation = useMutation({
    mutationFn: async (profileData: CommunityScopedUserProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.saveCommunityScopedUserProfile(communityName, profileData);
    },
    onSuccess: () => {
      toast.success('Profile saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['community-scoped-profile', communityName, memberPrincipal.toString()] });
      queryClient.invalidateQueries({ queryKey: ['community-scoped-profiles', communityName] });
      setIsEditing(false);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    const profileData: CommunityScopedUserProfile = {
      name: name.trim(),
      services,
      activities,
      socialNetworkLinks,
    };

    saveMutation.mutate(profileData);
  };

  const handleAddService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleAddActivity = () => {
    if (newActivity.trim()) {
      setActivities([...activities, newActivity.trim()]);
      setNewActivity('');
    }
  };

  const handleRemoveActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
      setSocialNetworkLinks([...socialNetworkLinks, newLink.trim()]);
      setNewLink('');
    }
  };

  const handleRemoveLink = (index: number) => {
    setSocialNetworkLinks(socialNetworkLinks.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name);
      setServices(profile.services);
      setActivities(profile.activities);
      setSocialNetworkLinks(profile.socialNetworkLinks);
    } else {
      setName('');
      setServices([]);
      setActivities([]);
      setSocialNetworkLinks([]);
    }
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-amber-900 dark:text-amber-100">
            {isOwnProfile ? 'My Community Profile' : 'Member Profile'}
          </DialogTitle>
          <DialogDescription>
            {isOwnProfile
              ? 'Your profile in this community'
              : `${profile?.name || 'Member'}'s profile in this community`}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <User className="w-4 h-4" />
                Name
              </Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="border-amber-200 dark:border-amber-800"
                />
              ) : (
                <p className="text-lg font-medium">{profile?.name || 'No name set'}</p>
              )}
            </div>

            <Separator />

            {/* Services */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <Briefcase className="w-4 h-4" />
                Services
              </Label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="Add a service"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
                      className="border-amber-200 dark:border-amber-800"
                    />
                    <Button
                      type="button"
                      onClick={handleAddService}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {service}
                        <button
                          onClick={() => handleRemoveService(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile?.services && profile.services.length > 0 ? (
                    profile.services.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No services listed</p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Activities */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <Activity className="w-4 h-4" />
                Activities
              </Label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      placeholder="Add an activity"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
                      className="border-amber-200 dark:border-amber-800"
                    />
                    <Button
                      type="button"
                      onClick={handleAddActivity}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activities.map((activity, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {activity}
                        <button
                          onClick={() => handleRemoveActivity(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile?.activities && profile.activities.length > 0 ? (
                    profile.activities.map((activity, index) => (
                      <Badge key={index} variant="secondary">
                        {activity}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No activities listed</p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Social Network Links */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <LinkIcon className="w-4 h-4" />
                Social Network Links
              </Label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      placeholder="Add a link"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                      className="border-amber-200 dark:border-amber-800"
                    />
                    <Button
                      type="button"
                      onClick={handleAddLink}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {socialNetworkLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded">
                        <LinkIcon className="w-4 h-4 text-amber-600" />
                        <span className="flex-1 text-sm truncate">{link}</span>
                        <button
                          onClick={() => handleRemoveLink(index)}
                          className="hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {profile?.socialNetworkLinks && profile.socialNetworkLinks.length > 0 ? (
                    profile.socialNetworkLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                      >
                        <LinkIcon className="w-4 h-4 text-amber-600" />
                        <span className="text-sm truncate text-amber-900 dark:text-amber-100">{link}</span>
                      </a>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No links added</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {isOwnProfile && !isLoading && (
          <DialogFooter>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saveMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              >
                {profile ? 'Edit Profile' : 'Create Profile'}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
