'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function ConfigureBreadcrumb() {
  const pathname = usePathname();

  // Determine the current page based on route
  const getCurrentPage = () => {
    if (pathname === '/instagram-jobs') return 'Instagram Jobs';
    if (pathname === '/threads-jobs') return 'Threads Jobs';
    if (pathname === '/tiktok-jobs') return 'TikTok Jobs';
    if (pathname === '/x-jobs') return 'X Jobs';
    return 'New Scraping Job';
  };

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/configure">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-muted-foreground">
            {getCurrentPage()}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
