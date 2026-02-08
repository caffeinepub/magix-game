import { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useActor } from '../hooks/useActor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { parsePrincipal } from '../lib/principal';
import { User, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { UserProfile } from '../backend';

export function ProfilePublicPage() {
  const { principal: principalParam } = useParams({ from: '/profile/$principal' });
  const { actor } = useActor();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (actor && principalParam) {
      loadProfile();
    }
  }, [actor, principalParam]);

  const loadProfile = async () => {
    if (!actor || !principalParam) return;

    setIsLoading(true);
    setError(null);
    try {
      const principal = parsePrincipal(principalParam);
      const profileData = await actor.getProfile(principal);
      setProfile(profileData);
    } catch (err) {
      console.error('Load profile error:', err);
      setError('Profile not found or user has not created a profile yet.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert className="border-amber-300 dark:border-amber-700">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Profile Not Found</AlertTitle>
          <AlertDescription>{error || 'This user has not created a profile yet.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-amber-200 dark:border-amber-800 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <User className="w-6 h-6" />
            {profile.displayName}
          </CardTitle>
          <Badge variant="secondary" className="w-fit mt-2 font-mono text-xs">
            {principalParam}
          </Badge>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {profile.bio && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Bio</h3>
              <p className="text-foreground whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {profile.links.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Links
                </h3>
                <div className="space-y-2">
                  {profile.links.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-amber-600 dark:text-amber-400 hover:text-orange-600 dark:hover:text-orange-400 hover:underline break-all"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
