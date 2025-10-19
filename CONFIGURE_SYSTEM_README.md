# Scraping Job Configuration System

## Overview

This system provides a comprehensive interface for creating and managing Instagram scraping jobs with Airtable integration.

## Features

### 1. **Login Flow**
- After successful login, users are redirected to `/configure`
- Credentials stored in `.env.local`:
  - Username: `kwaku`
  - Password: `korankye`
  - OTP: `123456`

### 2. **Persistent Sidebar**
The sidebar includes three main sections:

#### Platform Folders (Top)
- Instagram
- Threads  
- TikTok
- X (Twitter)

Clicking a platform loads all scraping jobs for that platform from Supabase.

#### Recents (Middle)
- Shows the 10 most recently created scraping jobs
- Format: "Influencer Name – Platform"
- Stored in browser `localStorage` (persists after logout)
- Each item has a delete button (trash icon on hover)
- Clicking an item navigates to `/callum-dashboard/:jobId`

#### Logout (Bottom)
- Logs user out (clears authentication)
- Recents remain in localStorage

### 3. **Configure Page** (`/configure`)

Main content area with two views:

#### Default View: Create Scraping Job Card
Form with:
- **Influencer Name** (text input, required)
- **Platform** (select dropdown: Instagram, Threads, TikTok, X)
- **Number of VAs** (number input, minimum 1)
- **Create Job** button

#### Platform View: Job List
When a platform is selected from the sidebar, shows all jobs for that platform.

### 4. **Job Creation Flow**

#### Step 1: Job Creation
When "Create Job" is clicked:
1. Creates a new record in Supabase `scraping_jobs` table
2. Adds job to localStorage recents (at the top)
3. Opens Airtable Link Dialog

#### Step 2: Airtable Link Dialog
- **Non-skippable** modal dialog
- User must provide a valid Airtable base URL
- Validates URL format (must match `https://airtable.com/...`)
- No cancel button - must enter valid link to proceed

#### Step 3: Airtable Setup Progress
After valid link is submitted:
1. Updates job record with `airtable_link` in Supabase
2. Shows animated progress bar (0% → 100%)
3. Text: "Setting up Airtable connection..."
4. Takes approximately 3 seconds

#### Step 4: Completion & Redirect
When progress reaches 100%:
1. Shows success toast: "Scraping job created successfully!"
2. Waits 300ms for smooth transition
3. Redirects to `/callum-dashboard/:jobId`

## Data Storage

| Data | Storage | Persists After Logout? | Clears When? |
|------|---------|----------------------|--------------|
| Job records | Supabase | ✅ Yes | Never (database) |
| Recents list | localStorage | ✅ Yes | Browser cache cleared |
| User session | Memory | ❌ No | On logout |

## Database Schema

```sql
CREATE TABLE scraping_jobs (
  id UUID PRIMARY KEY,
  influencer TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('Instagram', 'Threads', 'TikTok', 'X')),
  num_vas INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  airtable_link TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

## Setup Instructions

### 1. Database Setup
Run the SQL migration in your Supabase dashboard:
```bash
# In Supabase SQL Editor, run:
client/database_setup.sql
```

### 2. Install Dependencies
```bash
cd client
npm install
```

### 3. Environment Variables
Ensure `.env.local` has:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_LOGIN_USERNAME=kwaku
NEXT_PUBLIC_LOGIN_PASSWORD=korankye
NEXT_PUBLIC_LOGIN_OTP=123456
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## Components

| Component | Purpose |
|-----------|---------|
| `app-sidebar.tsx` | Main sidebar with platforms, recents, and logout |
| `recent-item.tsx` | Individual recent job item with delete button |
| `configure-job-card.tsx` | Form for creating new scraping jobs |
| `job-list-by-platform.tsx` | Display jobs filtered by platform |
| `airtable-link-dialog.tsx` | Modal for entering Airtable base URL |
| `airtable-progress-dialog.tsx` | Progress bar during Airtable setup |

## Utility Functions

### `lib/recents.ts`
- `getRecents()` - Get all recent jobs from localStorage
- `addRecent(job)` - Add new job to recents (max 10)
- `removeRecent(jobId)` - Delete job from recents
- `clearRecents()` - Clear all recents

## User Flow

```
Login (/callum)
  ↓
Configure Page (/configure)
  ↓
Fill Job Form → Click "Create Job"
  ↓
[Job Created in Supabase + Added to Recents]
  ↓
Airtable Link Dialog (non-skippable)
  ↓
Enter Valid Airtable URL → Click "Continue"
  ↓
[Update Supabase with Airtable Link]
  ↓
Progress Bar (3 seconds)
  ↓
Success Toast → Redirect to Dashboard
  ↓
Dashboard (/callum-dashboard/:jobId)
```

## Notes

- Recents update in real-time across the app
- Sidebar is always visible after login
- Platform folders fetch fresh data from Supabase on click
- Delete from recents only removes from localStorage, not Supabase
- Logout preserves recents for next session

## Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (Database & Auth)
- **ShadCN UI** (Components)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)
