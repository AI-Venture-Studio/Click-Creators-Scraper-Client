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

type DialogState = 'none' | 'airtable-link' | 'progress';

export default function ConfigurePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>('none');
  const [currentJobData, setCurrentJobData] = useState<{
    jobId: string;
    influencer: string;
    platform: Platform;
    numVAs: number;
  } | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const { logout } = useAuth();

  // Session logout on page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Set a flag in sessionStorage to indicate a refresh is happening
      sessionStorage.setItem('page-refreshed', 'true');
    };

    // Check if this is a fresh load after a refresh
    if (sessionStorage.getItem('page-refreshed') === 'true') {
      sessionStorage.removeItem('page-refreshed');
      logout();
      router.push('/callum');
      return;
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [logout, router]);

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

  const handleAirtableLinkSubmit = async (airtableLink: string) => {
    if (!currentJobData) return;

    console.log('Airtable link submitted:', airtableLink);
    console.log('Job data to be saved:', currentJobData);

    // TODO: Database integration will be configured later
    // This is where we'll create the job in Supabase with:
    // - influencer: currentJobData.influencer
    // - platform: currentJobData.platform
    // - num_vas: currentJobData.numVAs
    // - airtable_link: airtableLink
    // - status: 'queued'

    // For now, show progress dialog
    setDialogState('progress');
    
    // Show a toast to indicate the data was captured
    toast({
      title: 'Data Captured',
      description: `Job for ${currentJobData.influencer} on ${currentJobData.platform} will be created (DB integration pending)`,
    });
  };

  const handleProgressComplete = () => {
    if (!currentJobData) return;

    // Show success toast
    toast({
      title: 'Success!',
      description: 'Scraping job created successfully!',
    });

    // Reset state
    setDialogState('none');
    setIsSubmitting(false);
    
    // Redirect to dashboard
    router.push('/callum-dashboard');
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
      />
    </SidebarProvider>
  );
}
