'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Instagram, MessageCircle, Music2, Twitter, LogOut, Folder, Plus } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RecentItem } from '@/components/recent-item';
import { LogoutConfirmationDialog } from '@/components/logout-confirmation-dialog';
import { Platform, getRecents, RecentJob } from '@/lib/recents';
import { useAuth } from '@/contexts/auth-context';

const platforms = [
  { name: 'Instagram' as Platform, icon: Instagram, route: '/instagram-jobs', enabled: true },
  { name: 'Threads' as Platform, icon: MessageCircle, route: '/threads-jobs', enabled: false },
  { name: 'TikTok' as Platform, icon: Music2, route: '/tiktok-jobs', enabled: false },
  { name: 'X' as Platform, icon: Twitter, route: '/x-jobs', enabled: false },
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
        {/* New Scraping Job Button */}
        <div className="px-3 pt-4 pb-2">
          <Button 
            className="w-full justify-start gap-2" 
            onClick={() => router.push('/configure')}
          >
            <Plus className="h-4 w-4" />
            <span>New Scraping Campaign</span>
          </Button>
        </div>

        <Separator className="my-2" />

        {/* Social Media Folders */}
        <SidebarGroup>
          <SidebarGroupLabel>Platforms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider>
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const menuButton = (
                    <SidebarMenuButton
                      onClick={() => platform.enabled && router.push(platform.route)}
                      isActive={pathname === platform.route}
                      disabled={!platform.enabled}
                      className={!platform.enabled ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{platform.name}</span>
                    </SidebarMenuButton>
                  );

                  return (
                    <SidebarMenuItem key={platform.name}>
                      {!platform.enabled ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {menuButton}
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>Coming soon</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        menuButton
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        {/* Recents Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Recent Campaigns</SidebarGroupLabel>
          <SidebarGroupContent>
            {recents.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No recent campaigns
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
