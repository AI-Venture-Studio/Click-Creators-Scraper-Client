'use client';

import Image from 'next/image';
import { useSidebar } from '@/components/ui/sidebar';
import { ConfigureBreadcrumb } from '@/components/configure-breadcrumb';
import { ConfigureJobCard } from '@/components/configure-job-card';
import { Platform } from '@/lib/recents';

interface ConfigureContentProps {
  onJobSubmit: (data: { influencer: string; platform: Platform; numVAs: number }) => void;
  isSubmitting: boolean;
}

export function ConfigureContent({ onJobSubmit, isSubmitting }: ConfigureContentProps) {
  const { open, toggleSidebar } = useSidebar();

  return (
    <div className="flex-1">
      {/* Logo/Toggle Button - Shows when sidebar is closed */}
      {!open && (
        <div 
          className="fixed top-4 left-4 z-50 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={toggleSidebar}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg border-2 border-primary/20">
            <Image
              src="/aivs logo.JPG"
              alt="AIVS Logo - Click to open sidebar"
              width={40}
              height={40}
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}
      
      <main className={`flex-1 p-6 ${!open ? 'pl-20' : ''}`}>
        <ConfigureBreadcrumb />
        
        <div className="max-w-2xl mx-auto">
          <ConfigureJobCard
            onSubmit={onJobSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>
    </div>
  );
}
