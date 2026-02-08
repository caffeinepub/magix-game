import { useState, useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { RequireAuth } from '../components/RequireAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Plus, X, Loader2, Save } from 'lucide-react';

export function ProfileMePage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  useEffect(() => {
    if (actor && isAuthenticated) {
      loadProfile();
    }
  }, [actor, isAuthenticated]);

  const loadProfile = async () => {
    if (!actor || !identity) return;

    setIsLoading(true);
    try {
      const principal = identity.getPrincipal();
      const profile = await actor.getProfile(principal);
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setLinks(profile.links.length > 0 ? profile.links : ['']);
    } catch (error) {
      console.log('No profile found, starting fresh');
      setLinks(['']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!actor || !displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    setIsSaving(true);
    try {
      const filteredLinks = links.filter((link) => link.trim() !== '');
      await actor.createOrUpdateProfile(displayName.trim(), bio.trim(), filteredLinks);
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const addLink = () => {
    setLinks([...links, '']);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  return (
    <RequireAuth message="Sign in to create and edit your profile.">
      <div className="max-w-2xl mx-auto">
        <Card className="border-amber-200 dark:border-amber-800 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <User className="w-6 h-6" />
              My Profile
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Create your public profile to connect with the community
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="border-amber-200 dark:border-amber-800 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="border-amber-200 dark:border-amber-800 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Social Links & Business</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLink}
                      className="border-amber-300 dark:border-amber-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Link
                    </Button>
                  </div>
                  {links.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={link}
                        onChange={(e) => updateLink(index, e.target.value)}
                        placeholder="https://example.com"
                        className="border-amber-200 dark:border-amber-800 focus:ring-amber-500"
                      />
                      {links.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeLink(index)}
                          className="border-amber-300 dark:border-amber-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving || !displayName.trim()}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
