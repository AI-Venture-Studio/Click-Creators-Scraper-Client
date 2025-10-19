'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface AirtableProgressDialogProps {
  open: boolean;
  onComplete: () => void;
}

export function AirtableProgressDialog({ open, onComplete }: AirtableProgressDialogProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      return;
    }

    // Simulate progress from 0 to 100%
    const duration = 3000; // 3 seconds total
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    const increment = 100 / steps;

    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += increment;
      
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(timer);
        // Wait a bit at 100% before completing
        setTimeout(() => {
          onComplete();
        }, 500);
      } else {
        setProgress(currentProgress);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [open, onComplete]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Setting up Airtable Connection</DialogTitle>
          <DialogDescription>
            Please wait while we configure your Airtable integration...
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-6">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center text-muted-foreground">
            {Math.round(progress)}%
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
