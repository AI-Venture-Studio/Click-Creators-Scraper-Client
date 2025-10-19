/**
 * Types and utilities for managing recent scraping jobs in localStorage
 */

export type Platform = 'Instagram' | 'Threads' | 'TikTok' | 'X';

export interface RecentJob {
  jobId: string;
  influencer: string;
  platform: Platform;
  createdAt: string;
}

const RECENTS_KEY = 'scraping_job_recents';
const MAX_RECENTS = 10; // Keep last 10 recent jobs

/**
 * Get all recent jobs from localStorage
 */
export function getRecents(): RecentJob[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(RECENTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as RecentJob[];
  } catch (error) {
    console.error('Error reading recents from localStorage:', error);
    return [];
  }
}

/**
 * Add a new job to recents (at the top)
 */
export function addRecent(job: RecentJob): void {
  if (typeof window === 'undefined') return;
  
  try {
    const recents = getRecents();
    
    // Remove if already exists (to avoid duplicates)
    const filtered = recents.filter(r => r.jobId !== job.jobId);
    
    // Add to top and limit to MAX_RECENTS
    const updated = [job, ...filtered].slice(0, MAX_RECENTS);
    
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error adding recent to localStorage:', error);
  }
}

/**
 * Remove a job from recents
 */
export function removeRecent(jobId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const recents = getRecents();
    const updated = recents.filter(r => r.jobId !== jobId);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing recent from localStorage:', error);
  }
}

/**
 * Clear all recents
 */
export function clearRecents(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(RECENTS_KEY);
  } catch (error) {
    console.error('Error clearing recents from localStorage:', error);
  }
}
