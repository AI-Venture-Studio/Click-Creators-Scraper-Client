'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Instagram, MessageCircle, Music2, Twitter, LogOut, Folder } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RecentItem } from '@/components/recent-item';
import { LogoutConfirmationDialog } from '@/components/logout-confirmation-dialog';
import { Platform, getRecents, RecentJob } from '@/lib/recents';
import { useAuth } from '@/contexts/auth-context';

const platforms = [
  { name: 'Instagram' as Platform, icon: Instagram, route: '/instagram-jobs' },
  { name: 'Threads' as Platform, icon: MessageCircle, route: '/threads-jobs' },
  { name: 'TikTok' as Platform, icon: Music2, route: '/tiktok-jobs' },
  { name: 'X' as Platform, icon: Twitter, route: '/x-jobs' },
];

export function AppSidebar() {
  const [recents, setRecents] = useState<RecentJob[]>([]);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Load recents on mount
    loadRecents();

    // Set up interval to check for updates
    const interval = setInterval(loadRecents, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadRecents = () => {
    setRecents(getRecents());
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src="/aivs logo.JPG"
              alt="AIVS Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="font-semibold text-sm">AIVS</span>
        </div>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        {/* Social Media Folders */}
        <SidebarGroup>
          <SidebarGroupLabel>Platforms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <SidebarMenuItem key={platform.name}>
                    <SidebarMenuButton
                      onClick={() => router.push(platform.route)}
                      isActive={pathname === platform.route}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{platform.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        {/* Recents Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Recent Jobs</SidebarGroupLabel>
          <SidebarGroupContent>
            {recents.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No recent jobs
              </p>
            ) : (
              <div className="space-y-1">
                {recents.map((job) => (
                  <RecentItem
                    key={job.jobId}
                    job={job}
                    onDelete={loadRecents}
                  />
                ))}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
      />
    </Sidebar>
  );
}
