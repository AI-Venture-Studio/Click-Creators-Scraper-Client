/**
 * Scraping Jobs API Utilities
 * 
 * Helper functions for interacting with the multi-tenant scraping jobs system
 */

import { supabase } from './supabase';
import type {
  ScrapingJob,
  CreateScrapingJobInput,
  UpdateScrapingJobInput,
  ScrapingJobWithStats,
  JobStatistics,
  Platform,
  JobStatus,
  GlobalUsername,
  DailyAssignment
} from '@/types/scraping-jobs';

/**
 * Create a new scraping job
 */
export async function createScrapingJob(
  input: CreateScrapingJobInput
): Promise<ScrapingJob | null> {
  try {
    const { data, error } = await supabase
      .from('scraping_jobs')
      .insert({
        influencer_name: input.influencer_name,
        platform: input.platform,
        airtable_base_id: input.airtable_base_id,
        num_vas: input.num_vas || null,
        status: input.status || 'active',
        base_id: input.airtable_base_id // Use airtable_base_id for multi-tenant isolation
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating scraping job:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error creating scraping job:', error);
    return null;
  }
}

/**
 * Get all scraping jobs
 */
export async function getAllJobs(): Promise<ScrapingJob[]> {
  try {
    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching jobs:', error);
    return [];
  }
}

/**
 * Get a single scraping job by ID
 */
export async function getJobById(jobId: string): Promise<ScrapingJob | null> {
  try {
    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching job:', error);
    return null;
  }
}

/**
 * Get jobs by platform
 */
export async function getJobsByPlatform(
  platform: Platform,
  activeOnly = false
): Promise<ScrapingJob[]> {
  try {
    let query = supabase
      .from('scraping_jobs')
      .select('*')
      .eq('platform', platform);

    if (activeOnly) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs by platform:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching jobs by platform:', error);
    return [];
  }
}

/**
 * Get jobs by status
 */
export async function getJobsByStatus(status: JobStatus): Promise<ScrapingJob[]> {
  try {
    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs by status:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching jobs by status:', error);
    return [];
  }
}

/**
 * Get the active scraping job
 * 
 * Returns the first job with status='active', or the most recent job if none are active.
 * This is the primary method for determining which base_id to use for multi-tenant operations.
 * 
 * @returns The active scraping job, or null if no jobs exist
 */
export async function getActiveJob(): Promise<ScrapingJob | null> {
  try {
    // First, try to get an active job
    const { data: activeJobs, error: activeError } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (activeError) {
      console.error('Error fetching active job:', activeError);
      return null;
    }

    if (activeJobs && activeJobs.length > 0) {
      return activeJobs[0];
    }

    // Fallback: get the most recent job
    const { data: recentJobs, error: recentError } = await supabase
      .from('scraping_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentError) {
      console.error('Error fetching recent job:', recentError);
      return null;
    }

    return recentJobs && recentJobs.length > 0 ? recentJobs[0] : null;
  } catch (error) {
    console.error('Unexpected error fetching active job:', error);
    return null;
  }
}

/**
 * Get the base_id from the active scraping job
 * 
 * This is a convenience method that returns just the base_id for use in API calls.
 * 
 * @returns The base_id from the active job, or null if no job exists
 */
export async function getActiveBaseId(): Promise<string | null> {
  const activeJob = await getActiveJob();
  return activeJob?.base_id || null;
}

/**
 * Update a scraping job
 */
export async function updateJob(
  jobId: string,
  updates: UpdateScrapingJobInput
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('scraping_jobs')
      .update(updates)
      .eq('job_id', jobId);

    if (error) {
      console.error('Error updating job:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating job:', error);
    return false;
  }
}

/**
 * Update job status
 */
export async function updateJobStatus(
  jobId: string,
  status: JobStatus
): Promise<boolean> {
  return updateJob(jobId, { status });
}

/**
 * Get job statistics by base_id
 * Queries global_usernames and daily_assignments using base_id for accurate multi-tenant counts
 */
export async function getJobStatisticsByBaseId(baseId: string): Promise<JobStatistics | null> {
  try {
    // Get available usernames count (used = false)
    const { count: availableUsernames } = await supabase
      .from('global_usernames')
      .select('*', { count: 'exact', head: true })
      .eq('base_id', baseId)
      .eq('used', false);

    // Get used usernames count
    const { count: usedUsernames } = await supabase
      .from('global_usernames')
      .select('*', { count: 'exact', head: true })
      .eq('base_id', baseId)
      .eq('used', true);

    // Get total usernames count
    const { count: totalUsernames } = await supabase
      .from('global_usernames')
      .select('*', { count: 'exact', head: true })
      .eq('base_id', baseId);

    // Get assignments count (all assignments for this base)
    const { count: totalAssignments } = await supabase
      .from('daily_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('base_id', baseId);

    // Get scrape results count
    const { count: totalScrapeResults } = await supabase
      .from('scrape_results')
      .select('*', { count: 'exact', head: true })
      .eq('base_id', baseId);

    return {
      totalUsernames: totalUsernames || 0,
      usedUsernames: usedUsernames || 0,
      availableUsernames: availableUsernames || 0,
      totalAssignments: totalAssignments || 0,
      totalScrapeResults: totalScrapeResults || 0
    };
  } catch (error) {
    console.error('Error fetching job statistics by base_id:', error);
    return null;
  }
}

/**
 * Get job statistics
 * @deprecated Use getJobStatisticsByBaseId for accurate multi-tenant counts
 */
export async function getJobStatistics(jobId: string): Promise<JobStatistics | null> {
  try {
    // Get usernames count
    const { count: totalUsernames } = await supabase
      .from('global_usernames')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId);

    // Get used usernames count
    const { count: usedUsernames } = await supabase
      .from('global_usernames')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId)
      .eq('used', true);

    // Get available usernames count
    const { count: availableUsernames } = await supabase
      .from('global_usernames')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId)
      .eq('used', false);

    // Get assignments count
    const { count: totalAssignments } = await supabase
      .from('daily_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId);

    // Get scrape results count
    const { count: totalScrapeResults } = await supabase
      .from('scrape_results')
      .select('*', { count: 'exact', head: true })
      .eq('scraping_job_id', jobId);

    return {
      totalUsernames: totalUsernames || 0,
      usedUsernames: usedUsernames || 0,
      availableUsernames: availableUsernames || 0,
      totalAssignments: totalAssignments || 0,
      totalScrapeResults: totalScrapeResults || 0
    };
  } catch (error) {
    console.error('Error fetching job statistics:', error);
    return null;
  }
}

/**
 * Get job with statistics
 */
export async function getJobWithStats(
  jobId: string
): Promise<ScrapingJobWithStats | null> {
  try {
    const [job, stats] = await Promise.all([
      getJobById(jobId),
      getJobStatistics(jobId)
    ]);

    if (!job || !stats) {
      return null;
    }

    return {
      ...job,
      stats
    };
  } catch (error) {
    console.error('Error fetching job with stats:', error);
    return null;
  }
}

/**
 * Get all jobs with statistics
 */
export async function getAllJobsWithStats(): Promise<ScrapingJobWithStats[]> {
  try {
    const jobs = await getAllJobs();
    
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
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

    return jobsWithStats;
  } catch (error) {
    console.error('Error fetching all jobs with stats:', error);
    return [];
  }
}

/**
 * Get usernames for a specific job
 */
export async function getJobUsernames(
  jobId: string,
  onlyAvailable = false
): Promise<GlobalUsername[]> {
  try {
    let query = supabase
      .from('global_usernames')
      .select('*')
      .eq('job_id', jobId);

    if (onlyAvailable) {
      query = query.eq('used', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching job usernames:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching job usernames:', error);
    return [];
  }
}

/**
 * Get assignments for a specific job
 */
export async function getJobAssignments(jobId: string): Promise<DailyAssignment[]> {
  try {
    const { data, error } = await supabase
      .from('daily_assignments')
      .select('*')
      .eq('job_id', jobId)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching job assignments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching job assignments:', error);
    return [];
  }
}

/**
 * Add usernames to a job
 * 
 * @param jobId - The job ID to add usernames to
 * @param baseId - The base_id for multi-tenant isolation (required)
 * @param usernames - Array of usernames to add
 */
export async function addUsernamesToJob(
  jobId: string,
  baseId: string,
  usernames: Array<{
    id: string;
    username: string;
    full_name?: string;
  }>
): Promise<boolean> {
  try {
    if (!baseId) {
      console.error('base_id is required for adding usernames');
      return false;
    }

    const { error } = await supabase
      .from('global_usernames')
      .insert(
        usernames.map(u => ({
          id: u.id,
          username: u.username,
          full_name: u.full_name || null,
          job_id: jobId,
          used: false,
          base_id: baseId // Use provided base_id from context
        }))
      );

    if (error) {
      console.error('Error adding usernames to job:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error adding usernames to job:', error);
    return false;
  }
}

/**
 * Create assignments for a job
 * 
 * @param jobId - The job ID to create assignments for
 * @param campaignId - The campaign ID
 * @param baseId - The base_id for multi-tenant isolation (required)
 * @param assignments - Array of assignments to create
 */
export async function createJobAssignments(
  jobId: string,
  campaignId: string,
  baseId: string,
  assignments: Array<{
    id: string;
    username: string;
    full_name?: string;
    va_table_number: number;
    position: number;
  }>
): Promise<boolean> {
  try {
    if (!baseId) {
      console.error('base_id is required for creating assignments');
      return false;
    }

    const { error } = await supabase
      .from('daily_assignments')
      .insert(
        assignments.map(a => ({
          campaign_id: campaignId,
          id: a.id,
          username: a.username,
          full_name: a.full_name || null,
          va_table_number: a.va_table_number,
          position: a.position,
          job_id: jobId,
          status: 'pending',
          base_id: baseId // Use provided base_id from context
        }))
      );

    if (error) {
      console.error('Error creating job assignments:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error creating job assignments:', error);
    return false;
  }
}

/**
 * Delete a scraping job (soft delete by setting status to archived)
 */
export async function archiveJob(jobId: string): Promise<boolean> {
  return updateJobStatus(jobId, 'archived');
}

/**
 * Pause a scraping job
 */
export async function pauseJob(jobId: string): Promise<boolean> {
  return updateJobStatus(jobId, 'paused');
}

/**
 * Activate a scraping job
 */
export async function activateJob(jobId: string): Promise<boolean> {
  return updateJobStatus(jobId, 'active');
}

/**
 * Search jobs by influencer name
 */
export async function searchJobsByInfluencer(searchTerm: string): Promise<ScrapingJob[]> {
  try {
    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .ilike('influencer_name', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching jobs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error searching jobs:', error);
    return [];
  }
}
