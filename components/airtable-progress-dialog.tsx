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
import { useToast } from '@/hooks/use-toast';
import { createScrapingJob } from '@/lib/scraping-jobs';
import { Platform } from '@/types/scraping-jobs';
import { addRecent } from '@/lib/recents';
import type { Platform as RecentPlatform } from '@/lib/recents';
import { useBase } from '@/contexts/base-context';
import { apiPost } from '@/lib/api';

interface AirtableProgressDialogProps {
  open: boolean;
  onComplete: (jobId?: string) => void;
  airtableLink?: string;
  numVAs?: number;
  baseName?: string;
  influencerName?: string;
  platform?: Platform;
}

export function AirtableProgressDialog({ 
  open, 
  onComplete,
  airtableLink,
  numVAs,
  baseName,
  influencerName,
  platform
}: AirtableProgressDialogProps) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false); // Prevent duplicate calls
  const { toast } = useToast();
  
  // Get base_id from context
  const { baseId } = useBase();

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setStatusMessage('Initializing...');
      setError(null);
      setIsCreating(false);
      return;
    }

    // Prevent duplicate API calls
    if (isCreating) {
      return;
    }

    // If no airtableLink provided, just simulate progress (for backward compatibility)
    if (!airtableLink || !numVAs) {
      const duration = 3000;
      const interval = 50;
      const steps = duration / interval;
      const increment = 100 / steps;

      let currentProgress = 0;
      const timer = setInterval(() => {
        currentProgress += increment;
        
        if (currentProgress >= 100) {
          setProgress(100);
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 500);
        } else {
          setProgress(currentProgress);
        }
      }, interval);

      return () => clearInterval(timer);
    }

    // Actually create the Airtable tables
    const createTables = async () => {
      // Set flag to prevent duplicate calls
      setIsCreating(true);
      
      try {
        setProgress(10);
        setStatusMessage('Extracting base ID...');

        // Extract base_id from URL
        const baseIdMatch = airtableLink.match(/app[a-zA-Z0-9]+/);
        if (!baseIdMatch) {
          throw new Error('Invalid Airtable link. Could not extract base ID.');
        }
        const extractedBaseId = baseIdMatch[0];

        setProgress(20);
        setStatusMessage(`Creating ${numVAs} tables in Airtable...`);

        // Call the API to create tables using baseId from context (required for multi-tenancy)
        // If no active job exists yet, use the extracted baseId as a fallback
        const baseIdToUse = baseId || extractedBaseId;
        
        if (!baseIdToUse) {
          throw new Error('No base_id available. Please select an active job first.');
        }

        const result = await apiPost<{
          success: boolean;
          error?: string;
          message?: string;
          tables_created?: number;
          tables_skipped?: number;
          existing_job?: {
            job_id: string;
            influencer_name: string;
            platform: string;
          };
        }>('/api/airtable/create-base', baseIdToUse, {
          base_id: extractedBaseId,
          num_vas: numVAs,
          base_name: baseName || 'Campaign'
        });

        setProgress(60);

        setProgress(80);
        setStatusMessage('Verifying table creation...');

        if (!result.success) {
          // Check if this is a duplicate base_id error
          if (result.error === 'duplicate_base_id') {
            const existingJob = result.existing_job;
            const errorMsg = existingJob 
              ? `This Airtable base is already being used by "${existingJob.influencer_name}" on ${existingJob.platform}. Please use a different Airtable base.`
              : result.message || 'This Airtable base is already in use by another campaign.';
            
            toast({
              title: 'Duplicate Campaign Detected',
              description: errorMsg,
              variant: 'destructive',
            });
            
            throw new Error(errorMsg);
          }
          
          throw new Error(result.error || 'Table creation failed');
        }

        setProgress(100);
        const totalTables = (result.tables_created || 0) + (result.tables_skipped || 0);
        setStatusMessage(
          (result.tables_skipped || 0) > 0
            ? `${result.tables_created} new tables created, ${result.tables_skipped} already existed`
            : `Successfully created ${result.tables_created} tables!`
        );

        // Save job to Supabase if we have the required info
        let jobId: string | undefined;
        
        console.log('Checking if we should save to Supabase:', {
          influencerName,
          platform,
          extractedBaseId,
          shouldSave: !!(influencerName && platform && extractedBaseId)
        });
        
        if (influencerName && platform && extractedBaseId) {
          setProgress(90);
          setStatusMessage('Saving job to database...');
          
          console.log('Creating job with data:', {
            influencer_name: influencerName,
            platform: platform,
            airtable_base_id: extractedBaseId,
            num_vas: numVAs,
            status: 'active'
          });
          
          const job = await createScrapingJob({
            influencer_name: influencerName,
            platform: platform,
            airtable_base_id: extractedBaseId,
            num_vas: numVAs,
            status: 'active'
          });

          if (!job) {
            console.error('Failed to save job to database');
            toast({
              title: 'Warning',
              description: 'Tables created but failed to save job details',
              variant: 'destructive',
            });
          } else {
            console.log('Job saved successfully:', job);
            jobId = job.job_id;
            
            // Add to recents
            const platformCapitalized = platform.charAt(0).toUpperCase() + platform.slice(1) as RecentPlatform;
            addRecent({
              jobId: job.job_id,
              influencer: influencerName,
              platform: platformCapitalized,
              createdAt: new Date().toISOString()
            });
          }
        }

        setProgress(100);

        // Show success toast
        toast({
          title: 'Tables Ready!',
          description: result.message || `Successfully set up ${totalTables} Daily Outreach Tables`,
        });

        // Wait a bit before completing
        setTimeout(() => {
          onComplete(jobId);
        }, 1000);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setStatusMessage('Failed to create tables');
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });

        // Wait before closing on error
        setTimeout(() => {
          onComplete();
        }, 3000);
      }
    };

    createTables();
  }, [open, airtableLink, numVAs, baseName, toast, onComplete, isCreating]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {error ? 'Setup Failed' : 'Setting up Airtable Tables'}
          </DialogTitle>
          <DialogDescription>
            {error 
              ? 'An error occurred during table creation' 
              : 'Please wait while we create your Daily Outreach Tables...'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-6">
          <Progress value={progress} className="w-full" />
          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              {Math.round(progress)}%
            </p>
            <p className="text-sm text-center font-medium">
              {statusMessage}
            </p>
            {error && (
              <p className="text-sm text-center text-destructive mt-2">
                {error}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
