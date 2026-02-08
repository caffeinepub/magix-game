import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Users, Plus, Loader2, ArrowRight, Sparkles, ShieldAlert } from 'lucide-react';
import { getErrorMessage, isAuthorizationError } from '../lib/errorMessage';

export function CommunitiesPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDescription, setNewCommunityDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const { data: isAdmin = false, isLoading: isAdminLoading } = useIsCallerAdmin();

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCommunities();
    },
    enabled: !!actor,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !newCommunityName.trim()) throw new Error('Invalid input');
      return actor.createCommunity(newCommunityName.trim(), newCommunityDescription.trim() || null);
    },
    onSuccess: () => {
      toast.success('Community created successfully!');
      setNewCommunityName('');
      setNewCommunityDescription('');
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
    onError: (error) => {
      console.error('Create error:', error);
      const errorMessage = getErrorMessage(error);
      
      if (isAuthorizationError(errorMessage)) {
        toast.error(errorMessage);
      } else {
        toast.error('Failed to create community');
      }
    },
  });

  const handleCreate = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to create a community');
      return;
    }
    if (!newCommunityName.trim()) {
      toast.error('Community name is required');
      return;
    }
    createMutation.mutate();
  };

  const canCreateCommunity = isAuthenticated && isAdmin;
  const showAdminOnlyNote = isAuthenticated && !isAdmin && !isAdminLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            Communities
          </h1>
          <p className="text-muted-foreground mt-2">Join a community and build together</p>
        </div>
        {canCreateCommunity && !showCreateForm && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Community
          </Button>
        )}
      </div>

      {showAdminOnlyNote && (
        <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-900 dark:text-amber-100">
            Only the admin can create communities.
          </AlertDescription>
        </Alert>
      )}

      {showCreateForm && canCreateCommunity && (
        <Card className="border-amber-200 dark:border-amber-800 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
            <CardTitle className="text-amber-900 dark:text-amber-100">Create New Community</CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Start a new community and invite others to join
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Community Name *</Label>
              <Input
                id="name"
                value={newCommunityName}
                onChange={(e) => setNewCommunityName(e.target.value)}
                placeholder="Enter community name"
                className="border-amber-200 dark:border-amber-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={newCommunityDescription}
                onChange={(e) => setNewCommunityDescription(e.target.value)}
                placeholder="Describe your community..."
                rows={3}
                className="border-amber-200 dark:border-amber-800"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !newCommunityName.trim()}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Community'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-200 dark:border-amber-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <Users className="w-5 h-5" />
            All Communities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : communities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No communities yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {communities.map(([name, description], index) => (
                <div key={name}>
                  {index > 0 && <Separator className="my-3" />}
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-amber-900 dark:text-amber-100">{name}</h3>
                      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                    </div>
                    <Button
                      onClick={() => navigate({ to: '/community/$name', params: { name } })}
                      variant="outline"
                      className="border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    >
                      View
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
