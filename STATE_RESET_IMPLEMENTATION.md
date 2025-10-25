# Page State Reset Implementation

## Overview

This document describes the implementation of isolated page state management to ensure that when users navigate between pages, no data or component state carries over from one page to another.

## Problem Statement

Previously, when navigating between pages (e.g., Dashboard → Campaigns, or Instagram Campaign → Platform Overview), residual state from previous pages could:
- Persist and display outdated data
- Cause UI flashing when old data briefly appears before being replaced
- Lead to data mixing between different campaigns or jobs
- Create confusion when campaign-specific data appears in wrong contexts

## Solution Architecture

### 1. Custom Hooks for State Reset

**Location:** `hooks/use-page-reset.ts`

Two hooks were created to manage page state lifecycle:

#### `usePageReset(resetCallback)`
- Automatically calls the reset callback when the component unmounts
- Used for cleaning up page-level state when navigating away
- Example use case: Resetting form data when leaving the configure page

#### `useResetOnChange(dependency, resetCallback, options)`
- Resets state when a specific dependency changes (e.g., job ID, base ID)
- Also resets on component unmount
- `skipInitial` option prevents reset on initial mount
- Example use case: Resetting dashboard data when switching between jobs

### 2. Context Updates

#### BaseContext Enhancements
**Location:** `contexts/base-context.tsx`

Added `clearActiveJob()` function to the BaseContext:
```typescript
interface BaseContextType {
  // ... existing properties
  clearActiveJob: () => void  // New: Clear the active job
}
```

This allows pages to explicitly clear job context when needed, though in practice the automatic reset mechanisms handle most cases.

#### AssignmentProgressContext
The existing `resetAssignment()` function already provides proper cleanup. The context is properly scoped within the dashboard, so it naturally resets when navigating away.

## Implementation Details

### Pages Updated

#### 1. Configure Page (`app/configure/page.tsx`)
**State Reset:**
- Dialog state (none/airtable-link/progress)
- Form submission status
- Current job data
- Airtable link
- Created job ID

**Implementation:**
```typescript
usePageReset(() => {
  console.log('[ConfigurePage] Resetting page state on unmount');
  setDialogState('none');
  setIsSubmitting(false);
  setCurrentJobData(null);
  setAirtableLink('');
  setCreatedJobId(null);
});
```

#### 2. Dashboard Page (`app/callum-dashboard/page.tsx`)
**State Reset:**
- Scraped accounts list
- Total filtered count
- Scraping loading state
- Refresh key (forces child component refresh)
- VA assignment status
- Status messages

**Implementation:**
Two reset mechanisms:
1. On unmount (leaving dashboard):
```typescript
usePageReset(() => {
  setScrapedAccounts([]);
  setTotalFiltered(0);
  setIsScrapingLoading(false);
  setRefreshKey(0);
  setCanAssignToVAs(false);
  setStatusMessage('');
});
```

2. On job ID change (switching jobs):
```typescript
useResetOnChange(jobId, () => {
  setScrapedAccounts([]);
  setTotalFiltered(0);
  setIsScrapingLoading(false);
  setRefreshKey(prev => prev + 1);
  setCanAssignToVAs(false);
  setStatusMessage('');
}, { skipInitial: true });
```

#### 3. Platform Job List Pages
**Updated Files:**
- `app/instagram-jobs/page.tsx`
- `app/threads-jobs/page.tsx`
- `app/tiktok-jobs/page.tsx`
- `app/x-jobs/page.tsx`

**Implementation:**
Each page includes cleanup logging:
```typescript
usePageReset(() => {
  console.log('[PlatformJobs] Resetting page state on unmount');
});
```

The actual state is managed by the shared `JobListByPlatform` component, which has its own reset logic.

### Shared Components Updated

#### 1. JobListByPlatform (`components/job-list-by-platform.tsx`)
**State Reset:**
- Jobs list
- Loading state
- Refresh state
- Error state

**Implementation:**
```typescript
usePageReset(() => {
  console.log('[JobListByPlatform] Resetting component state on unmount');
  setJobs([]);
  setLoading(true);
  setIsRefreshing(false);
  setError(null);
});
```

#### 2. CampaignsTable (`components/campaigns-table.tsx`)
**State Reset:**
- Campaigns list
- Loading state
- Error state

**Implementation:**
Resets when `baseId` changes (switching between jobs):
```typescript
useResetOnChange(baseId, () => {
  console.log('[CampaignsTable] Resetting state due to baseId change');
  setCampaigns([]);
  setIsLoading(true);
  setError(null);
}, { skipInitial: true });
```

#### 3. UsernameStatusCard (`components/username-status-card.tsx`)
**State Reset:**
- Unused count
- Loading state
- Error state

**Implementation:**
```typescript
useResetOnChange(baseId, () => {
  console.log('[UsernameStatusCard] Resetting state due to baseId change');
  setUnusedCount(null);
  setIsLoading(true);
  setError(null);
}, { skipInitial: true });
```

#### 4. DependenciesCard (`components/dependencies-card.tsx`)
**State Reset:**
- Input value
- Accounts list
- Scrape count
- Loading states
- Dialog state
- Progress indicators

**Implementation:**
```typescript
useResetOnChange(baseId, () => {
  console.log('[DependenciesCard] Resetting state due to baseId change');
  setInputValue('');
  setAccounts([]);
  setTotalScrapeCount(150);
  setIsScrapingLoading(false);
  setIsLoadingProfiles(false);
  setIsEditDialogOpen(false);
  setProgress(0);
  setProgressStep('idle');
}, { skipInitial: true });
```

**Note:** Source profiles are **no longer automatically loaded** when `baseId` becomes available. Users must explicitly click the "Load source profiles" button in the dropdown menu to load profiles from the database.

## Expected Behavior

### ✅ Navigation Scenarios

1. **Dashboard → Platform List**
   - Dashboard state fully resets
   - Platform list loads fresh with no residual data
   - No flash of old campaign data

2. **Platform List → Dashboard (different job)**
   - Platform list state resets
   - Dashboard loads with job-specific data
   - All components query using correct baseId

3. **Dashboard (Job A) → Dashboard (Job B)**
   - All components detect baseId change
   - State resets before loading Job B data
   - No mixing of Job A and Job B data

4. **Configure → Platform List**
   - Form state completely resets
   - Dialog state cleared
   - No lingering job creation data

5. **Platform List → Configure → Cancel → Platform List**
   - Form resets on navigation to Configure
   - Form resets again when leaving Configure
   - Platform list shows fresh data each time

## Debugging

All reset operations include console logging for debugging:
- `[PageName] Resetting page state on unmount`
- `[ComponentName] Resetting state due to baseId change`

To verify proper reset behavior:
1. Open browser console
2. Navigate between pages
3. Look for reset log messages
4. Verify no data carries over between pages

## Benefits

1. **No Data Contamination:** Each page shows only its relevant data
2. **No UI Flashing:** Old data doesn't briefly appear before being replaced
3. **Clean State Transitions:** Navigation feels responsive and intentional
4. **Proper Multi-Tenancy:** Jobs remain isolated using baseId
5. **Better UX:** Users see exactly what they expect on each page
6. **Maintainable:** Reset logic is centralized in hooks and clearly documented

## Testing Checklist

- [ ] Navigate from Dashboard to Instagram Jobs - no campaign data persists
- [ ] Switch between different jobs in Dashboard - data updates correctly
- [ ] Navigate from Configure to Platform List - form data clears
- [ ] Cancel job creation - all dialog state resets
- [ ] Rapidly switch between pages - no stale data flashes
- [ ] Change active job in sidebar - all components update to new job
- [ ] Navigate between different platform job lists - each shows correct platform
- [ ] Open multiple campaigns sequentially - no data mixing

## Future Improvements

1. **Loading States:** Consider adding skeleton loaders during state reset transitions
2. **Optimistic Updates:** Cache some non-sensitive data for faster perceived performance
3. **Route Guards:** Add navigation confirmation for unsaved changes
4. **State Persistence:** Consider selective state persistence for user preferences
5. **Performance Monitoring:** Track reset operation performance in production
