import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { Hammer, Loader2 } from 'lucide-react';
import { getErrorMessage } from '../lib/errorMessage';
import type { Position } from '../backend';

interface AddMyPartButtonProps {
  communityName: string;
  isMember: boolean;
  eventId: string | null;
  isEventActive: boolean;
  userChoice: boolean | null;
  isEligible: boolean;
  onSuccess: () => void;
}

export function AddMyPartButton({
  communityName,
  isMember,
  eventId,
  isEventActive,
  userChoice,
  isEligible,
  onSuccess,
}: AddMyPartButtonProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const handleContribute = async () => {
    if (!actor || !isAuthenticated) {
      toast.error('Please sign in to contribute');
      return;
    }

    if (!isMember) {
      toast.error('You must join this community first');
      return;
    }

    if (!isEventActive || !eventId) {
      toast.error('No active event. Building is unavailable until an admin starts an event.');
      return;
    }

    if (userChoice === false) {
      toast.error('You chose not to build in this event');
      return;
    }

    if (!isEligible) {
      toast.error('You are not eligible to build in this event');
      return;
    }

    setIsSubmitting(true);
    try {
      const part: Position = {
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
      };

      await actor.contributeToConstruction(eventId, part);
      toast.success('Your part has been added!');
      onSuccess();
    } catch (error) {
      console.error('Contribution error:', error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Button disabled className="w-full sm:w-auto">
        Sign in to contribute
      </Button>
    );
  }

  if (!isMember) {
    return (
      <Button disabled className="w-full sm:w-auto">
        Join community to contribute
      </Button>
    );
  }

  if (!isEventActive) {
    return (
      <Button disabled className="w-full sm:w-auto">
        No active event
      </Button>
    );
  }

  if (userChoice === false) {
    return (
      <Button disabled className="w-full sm:w-auto">
        <Hammer className="w-4 h-4 mr-2" />
        Chose not to build
      </Button>
    );
  }

  if (!isEligible && userChoice === true) {
    return (
      <Button disabled className="w-full sm:w-auto">
        <Hammer className="w-4 h-4 mr-2" />
        Already Contributed
      </Button>
    );
  }

  return (
    <Button
      onClick={handleContribute}
      disabled={isSubmitting || !isEligible}
      className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white disabled:opacity-50"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <Hammer className="w-4 h-4 mr-2" />
          Add my part
        </>
      )}
    </Button>
  );
}
