'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { JobListByPlatform } from '@/components/job-list-by-platform';
import { useSidebar } from '@/components/ui/sidebar';
import { usePageReset } from '@/hooks/use-page-reset';
import Image from 'next/image';

function ThreadsJobsContent() {
  const { open, toggleSidebar } = useSidebar();

  // Reset page state when navigating away
  usePageReset(() => {
    console.log('[ThreadsJobs] Resetting page state on unmount');
  });

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3">
        {!open && (
          <div className="flex items-center gap-2 cursor-pointer" onClick={toggleSidebar}>
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src="/aivs logo.JPG"
                alt="AIVS Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Threads Campaigns</h1>
            <p className="text-muted-foreground">
              View and manage all Threads scraping campaigns
            </p>
          </div>
          
          <JobListByPlatform platform="threads" />
          
          {/* Footer */}
          <footer className="mt-12 text-center text-sm text-muted-foreground">
            Built by AIVS, 2025
          </footer>
        </div>
      </main>
    </>
  );
}

export default function ThreadsJobsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <ThreadsJobsContent />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
