import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

interface BuildChoicePromptProps {
  onYes: () => void;
  onNo: () => void;
  isSubmitting: boolean;
}

export function BuildChoicePrompt({ onYes, onNo, isSubmitting }: BuildChoicePromptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 border-amber-300 dark:border-amber-700 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <Building2 className="w-6 h-6" />
            Do you want to build?
          </CardTitle>
          <CardDescription>
            An event is active! Choose whether you'd like to contribute to the community construction.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button
            onClick={onYes}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
          >
            Yes
          </Button>
          <Button
            onClick={onNo}
            disabled={isSubmitting}
            variant="outline"
            className="flex-1"
          >
            No
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
