import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { DeploymentDiagnostics, downloadDiagnostics } from '@/lib/deploymentDiagnostics';
import { toast } from 'sonner';

interface DeploymentFailureDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diagnostics: DeploymentDiagnostics;
}

export function DeploymentFailureDetailsDialog({
  open,
  onOpenChange,
  diagnostics,
}: DeploymentFailureDetailsDialogProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(diagnostics.rawDetails);
      toast.success('Error details copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    try {
      downloadDiagnostics(diagnostics);
      toast.success('Error log downloaded');
    } catch (error) {
      toast.error('Failed to download error log');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Deployment Error Details</DialogTitle>
          <DialogDescription>
            Review the error information below. You can copy or download the details for debugging.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-amber-900 dark:text-amber-100">Summary</h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-slate-800 p-3 rounded-md border border-amber-200 dark:border-slate-700">
              {diagnostics.summary}
            </p>
          </div>

          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>Technical Details</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <ScrollArea className="h-64 w-full rounded-md border border-amber-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <pre className="p-4 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
                  {diagnostics.rawDetails}
                </pre>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="outline" className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              Copy Details
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Logs
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
