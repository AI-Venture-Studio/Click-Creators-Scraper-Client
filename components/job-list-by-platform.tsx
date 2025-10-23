'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Platform, 
  ScrapingJobWithStats,
  STATUS_CONFIG,
  isLegacyJob,
  getJobDisplayName
} from '@/types/scraping-jobs';
import { 
  getJobsByPlatform,
  getJobStatistics,
  updateJobStatus 
} from '@/lib/scraping-jobs';
import { Play, Pause, Archive, Eye, Plus, RefreshCw, ExternalLink } from 'lucide-react';

interface JobListByPlatformProps {
  platform: Platform;
}

export function JobListByPlatform({ platform }: JobListByPlatformProps) {
  const [jobs, setJobs] = useState<ScrapingJobWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, [platform]);

  async function fetchJobs() {
    try {
      setLoading(true);
      setError(null);
      
      const platformKey = platform.toLowerCase() as 'instagram' | 'threads' | 'tiktok' | 'x';
      const jobsData = await getJobsByPlatform(platformKey);
      
      // Fetch stats for each job
      const jobsWithStats = await Promise.all(
        jobsData.map(async (job) => {
          const stats = await getJobStatistics(job.job_id);
          return {
            ...job,
            stats: stats || {
              totalUsernames: 0,
              usedUsernames: 0,
              availableUsernames: 0,
              totalAssignments: 0,
              totalScrapeResults: 0
            }
          };
        })
      );
      
      setJobs(jobsWithStats);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchJobs();
  }

  async function handleStatusChange(jobId: string, newStatus: 'active' | 'paused' | 'archived') {
    try {
      await updateJobStatus(jobId, newStatus);
      await fetchJobs(); // Refresh the list
    } catch (err) {
      console.error('Error updating job status:', err);
    }
  }

  function getStatusBadgeVariant(status: string): "success" | "warning" | "info" | "default" {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'archived':
        return 'info';
      default:
        return 'default';
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function getPlatformDisplayName(platform: Platform): string {
    const names: Record<Platform, string> = {
      instagram: 'Instagram',
      threads: 'Threads',
      tiktok: 'TikTok',
      x: 'X'
    };
    return names[platform];
  }

  if (loading && !isRefreshing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getPlatformDisplayName(platform)} Jobs</CardTitle>
          <CardDescription>Loading jobs...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getPlatformDisplayName(platform)} Jobs</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{getPlatformDisplayName(platform)} Jobs</CardTitle>
            <CardDescription>
              Manage scraping jobs for {getPlatformDisplayName(platform)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => router.push(`/configure?platform=${platform.toLowerCase()}`)}>
              <Plus className="mr-2 h-4 w-4" />
              New Job
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No jobs found for {getPlatformDisplayName(platform)}. Create your first job to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Influencer</TableHead>
                <TableHead className="w-[150px]">Airtable Base</TableHead>
                <TableHead className="text-center w-[80px]">VAs</TableHead>
                <TableHead className="text-center w-[120px]">Usernames</TableHead>
                <TableHead className="text-center w-[130px]">Assignments</TableHead>
                <TableHead className="w-[120px]">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => {
                const isLegacy = isLegacyJob(job.job_id);
                const displayName = getJobDisplayName(job);
                const airtableUrl = job.airtable_base_id 
                  ? `https://airtable.com/${job.airtable_base_id}`
                  : null;
                
                return (
                  <TableRow 
                    key={job.job_id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/callum-dashboard?job=${job.job_id}`)}
                  >
                    <TableCell className="font-medium py-4">
                      {displayName}
                      {isLegacy && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Legacy
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      {airtableUrl ? (
                        <a 
                          href={airtableUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="text-sm">Open Base</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="text-sm font-medium">{job.num_vas || 0}</span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="text-sm">{job.stats?.totalUsernames || 0}</span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="text-sm">{job.stats?.totalAssignments || 0}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-4">
                      {formatDate(job.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

