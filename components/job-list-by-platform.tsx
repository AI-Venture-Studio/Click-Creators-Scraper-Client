'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Platform } from '@/lib/recents';
import { supabase } from '@/lib/supabase';

interface Job {
  id: string;
  influencer: string;
  platform: Platform;
  num_vas: number;
  status: string;
  created_at: string;
  airtable_link?: string;
}

interface JobListByPlatformProps {
  platform: Platform;
}

export function JobListByPlatform({ platform }: JobListByPlatformProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadJobs();
  }, [platform]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select('*')
        .eq('platform', platform)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobId: string) => {
    router.push(`/callum-dashboard/${jobId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Jobs Found</CardTitle>
          <CardDescription>
            No scraping jobs found for {platform}. Create a new job to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{platform} Scraping Jobs</h2>
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card
            key={job.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleJobClick(job.id)}
          >
            <CardHeader>
              <CardTitle>{job.influencer}</CardTitle>
              <CardDescription>
                {job.num_vas} VAs • Status: {job.status}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Created: {new Date(job.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
