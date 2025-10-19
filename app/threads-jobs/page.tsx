'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ConfigureBreadcrumb } from '@/components/configure-breadcrumb';
import { JobListByPlatform } from '@/components/job-list-by-platform';
import { useSidebar } from '@/components/ui/sidebar';
import Image from 'next/image';

function ThreadsJobsContent() {
  const { open } = useSidebar();

  return (
    <>
      <header className="flex items-center justify-between border-b px-6 py-3">
        {!open && (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => document.querySelector('[data-sidebar-trigger]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
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
        <ConfigureBreadcrumb />
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Threads Jobs</h1>
            <p className="text-muted-foreground">
              View and manage all Threads scraping jobs
            </p>
          </div>
          
          <JobListByPlatform platform="Threads" />
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
