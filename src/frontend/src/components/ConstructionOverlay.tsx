import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Building2, CheckCircle2 } from 'lucide-react';
import type { Position } from '../backend';

interface ConstructionOverlayProps {
  activeParts: Position[];
  targetParts: number;
  completedBuildings: Position[];
}

export function ConstructionOverlay({ activeParts, targetParts, completedBuildings }: ConstructionOverlayProps) {
  const progress = targetParts > 0 ? (activeParts.length / targetParts) * 100 : 0;

  return (
    <div className="absolute top-4 right-4 w-80 space-y-3">
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-amber-300 dark:border-amber-700 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <Building2 className="w-5 h-5" />
            Current Construction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100">
              {activeParts.length} / {targetParts} parts
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          {progress === 100 && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Construction Complete!
            </div>
          )}
        </CardContent>
      </Card>

      {completedBuildings.length > 0 && (
        <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-emerald-300 dark:border-emerald-700 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100 text-base">
              <CheckCircle2 className="w-4 h-4" />
              Completed Buildings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {completedBuildings.length}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
