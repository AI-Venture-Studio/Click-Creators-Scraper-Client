/**
 * Multi-Tenant Scraping Jobs Type Definitions
 * 
 * These types match the new scraping_jobs table structure
 * and provide type safety for multi-tenant operations.
 */

// Platform types
export type Platform = 'instagram' | 'threads' | 'tiktok' | 'x';

// Job status types
export type JobStatus = 'active' | 'paused' | 'archived';

/**
 * Scraping Job
 * 
 * Represents an influencer's scraping job configuration
 */
export interface ScrapingJob {
  job_id: string;
  influencer_name: string;
  platform: Platform;
  airtable_base_id: string;
  num_vas: number | null;
  status: JobStatus;
  created_at: string;
  updated_at: string | null;
}

/**
 * Create Scraping Job Input
 * 
 * Data required to create a new scraping job
 */
export interface CreateScrapingJobInput {
  influencer_name: string;
  platform: Platform;
  airtable_base_id: string;
  num_vas?: number;
  status?: JobStatus;
}

/**
 * Update Scraping Job Input
 * 
 * Data that can be updated on an existing job
 */
export interface UpdateScrapingJobInput {
  influencer_name?: string;
  platform?: Platform;
  airtable_base_id?: string;
  num_vas?: number;
  status?: JobStatus;
}

/**
 * Job Statistics
 * 
 * Aggregated statistics for a scraping job
 */
export interface JobStatistics {
  totalUsernames: number;
  usedUsernames: number;
  availableUsernames: number;
  totalAssignments: number;
  totalScrapeResults: number;
}

/**
 * Job with Statistics
 * 
 * Scraping job with computed statistics
 */
export interface ScrapingJobWithStats extends ScrapingJob {
  stats: JobStatistics;
}

/**
 * Global Username (Updated)
 * 
 * Username record linked to a scraping job
 */
export interface GlobalUsername {
  id: string;
  username: string;
  full_name: string | null;
  used_at: string | null;
  used: boolean;
  created_at: string;
  job_id: string | null; // Now nullable and references scraping_jobs
}

/**
 * Daily Assignment (Updated)
 * 
 * Assignment record linked to a scraping job
 */
export interface DailyAssignment {
  assignment_id: string;
  campaign_id: string;
  va_table_number: number;
  position: number;
  id: string;
  username: string;
  full_name: string | null;
  assigned_at: string;
  status: 'pending' | 'followed' | 'unfollow' | 'completed';
  updated_at: string | null;
  job_id: string | null; // Now nullable and references scraping_jobs
}

/**
 * Scrape Result (Updated)
 * 
 * Scraped profile result linked to a scraping job
 */
export interface ScrapeResult {
  id: number;
  job_id: string; // References scrape_jobs (async scraping)
  scraping_job_id: string | null; // References scraping_jobs (influencer job)
  profile_id: string;
  username: string;
  full_name: string | null;
  source_account: string | null;
  created_at: string | null;
}

/**
 * Platform Display Configuration
 */
export const PLATFORM_CONFIG: Record<Platform, {
  label: string;
  icon: string;
  color: string;
}> = {
  instagram: {
    label: 'Instagram',
    icon: '📷',
    color: '#E4405F'
  },
  threads: {
    label: 'Threads',
    icon: '🧵',
    color: '#000000'
  },
  tiktok: {
    label: 'TikTok',
    icon: '🎵',
    color: '#000000'
  },
  x: {
    label: 'X (Twitter)',
    icon: '𝕏',
    color: '#000000'
  }
};

/**
 * Status Display Configuration
 */
export const STATUS_CONFIG: Record<JobStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  active: {
    label: 'Active',
    color: '#16a34a',
    bgColor: '#dcfce7'
  },
  paused: {
    label: 'Paused',
    color: '#ea580c',
    bgColor: '#fed7aa'
  },
  archived: {
    label: 'Archived',
    color: '#64748b',
    bgColor: '#f1f5f9'
  }
};

/**
 * Legacy Placeholder Job ID
 * 
 * Special UUID for the placeholder job that contains all legacy data
 */
export const LEGACY_PLACEHOLDER_JOB_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Check if a job is the legacy placeholder
 */
export function isLegacyJob(jobId: string | null): boolean {
  return jobId === LEGACY_PLACEHOLDER_JOB_ID;
}

/**
 * Get job display name
 */
export function getJobDisplayName(job: ScrapingJob): string {
  return `${job.influencer_name}'s ${PLATFORM_CONFIG[job.platform].label} Job`;
}
