'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ConfigureContent } from '@/components/configure-content';
import { AirtableLinkDialog } from '@/components/airtable-link-dialog';
import { AirtableProgressDialog } from '@/components/airtable-progress-dialog';
import { Platform, addRecent } from '@/lib/recents';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { usePageReset } from '@/hooks/use-page-reset';

type DialogState = 'none' | 'airtable-link' | 'progress';

export default function ConfigurePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>('none');
  const [airtableLink, setAirtableLink] = useState<string>('');
  const [currentJobData, setCurrentJobData] = useState<{
    jobId: string;
    influencer: string;
    platform: Platform;
    numVAs: number;
  } | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const { logout } = useAuth();
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  // Reset all page state when navigating away from this page
  usePageReset(() => {
    console.log('[ConfigurePage] Resetting page state on unmount');
    setDialogState('none');
    setIsSubmitting(false);
    setCurrentJobData(null);
    setAirtableLink('');
    setCreatedJobId(null);
  });

  const handleJobSubmit = (data: {
    influencer: string;
    platform: Platform;
    numVAs: number;
  }) => {
    console.log('handleJobSubmit called with:', data);
    
    // Store the form data temporarily (not in DB yet)
    setCurrentJobData({
      jobId: '', // Will be generated after Airtable link is provided
      influencer: data.influencer,
      platform: data.platform,
      numVAs: data.numVAs,
    });

    // Show Airtable link dialog immediately
    console.log('Opening Airtable dialog...');
    setDialogState('airtable-link');
  };

  const handleDialogCancel = () => {
    // Close dialog and reset all state
    setDialogState('none');
    setIsSubmitting(false);
    setCurrentJobData(null);
    
    // Note: Form will reset itself via key change in ConfigureJobCard
    toast({
      title: 'Cancelled',
      description: 'Job creation cancelled. Form has been reset.',
    });
  };

  const handleAirtableLinkSubmit = async (submittedLink: string) => {
    if (!currentJobData) return;

    console.log('Airtable link submitted:', submittedLink);
    console.log('Job data to be saved:', currentJobData);

    // Store the Airtable link
    setAirtableLink(submittedLink);

    // Show progress dialog - this will now actually create the tables
    setDialogState('progress');
  };

  const handleProgressComplete = (jobId?: string) => {
    if (!currentJobData) return;

    // Show success toast
    toast({
      title: 'Success!',
      description: 'Scraping job created successfully!',
    });

    // Reset state
    setDialogState('none');
    setIsSubmitting(false);
    
    // If we have a job ID, redirect to that job's instance
    // Otherwise, redirect to the platform's jobs list
    if (jobId) {
      router.push(`/callum-dashboard?job=${jobId}`);
    } else {
      const platform = currentJobData.platform.toLowerCase();
      router.push(`/${platform}-jobs`);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <ConfigureContent
            onJobSubmit={handleJobSubmit}
            isSubmitting={isSubmitting}
            key={dialogState === 'none' ? 'reset' : 'active'}
          />
        </SidebarInset>
      </div>

      {/* Dialogs */}
      <AirtableLinkDialog
        open={dialogState === 'airtable-link'}
        onSubmit={handleAirtableLinkSubmit}
        onCancel={handleDialogCancel}
        influencerName={currentJobData?.influencer || ''}
        platform={currentJobData?.platform || ''}
      />
      
      <AirtableProgressDialog
        open={dialogState === 'progress'}
        onComplete={handleProgressComplete}
        airtableLink={airtableLink}
        numVAs={currentJobData?.numVAs}
        baseName={currentJobData ? `${currentJobData.influencer}'s ${currentJobData.platform} Job` : undefined}
        influencerName={currentJobData?.influencer}
        platform={currentJobData?.platform.toLowerCase() as 'instagram' | 'threads' | 'tiktok' | 'x'}
      />
    </SidebarProvider>
  );
}
