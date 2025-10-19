# Database Setup Guide

## Quick Start

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `vfixvelgubfcznsyinhe`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Migration

Copy and paste the contents of `database_setup.sql` into the SQL editor and click **Run**.

This will:
- ✅ Create the `scraping_jobs` table
- ✅ Add necessary indexes for performance
- ✅ Set up automatic `updated_at` timestamp updates
- ✅ Enable Row Level Security (RLS)
- ✅ Create policies for public access

### Step 3: Verify Table Creation

Run this query to verify:
```sql
SELECT * FROM scraping_jobs LIMIT 5;
```

You should see an empty table with these columns:
- `id` (UUID)
- `influencer` (TEXT)
- `platform` (TEXT)
- `num_vas` (INTEGER)
- `status` (TEXT)
- `airtable_link` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Step 4: Test Data (Optional)

To add test data:
```sql
INSERT INTO scraping_jobs (influencer, platform, num_vas, status) VALUES
  ('FitMomGhana', 'Instagram', 5, 'queued'),
  ('AfricanFashionDaily', 'Threads', 3, 'in_progress'),
  ('GhanaFoodie', 'TikTok', 2, 'completed');
```

## Troubleshooting

### If table already exists
If you get an error that the table already exists, you can drop it first:
```sql
DROP TABLE IF EXISTS scraping_jobs CASCADE;
```

Then run the migration again.

### If RLS policies fail
If you get policy errors, you can recreate them:
```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on scraping_jobs" ON scraping_jobs;

-- Recreate
CREATE POLICY "Allow all operations on scraping_jobs"
  ON scraping_jobs
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## Table Schema

```sql
scraping_jobs
├── id                UUID (Primary Key)
├── influencer        TEXT (NOT NULL)
├── platform          TEXT (NOT NULL) [Instagram, Threads, TikTok, X]
├── num_vas           INTEGER (NOT NULL, > 0)
├── status            TEXT (NOT NULL, default: 'queued')
│                     [queued, in_progress, completed, failed]
├── airtable_link     TEXT (nullable)
├── created_at        TIMESTAMPTZ (NOT NULL, default: NOW())
└── updated_at        TIMESTAMPTZ (NOT NULL, auto-updated)
```

## Next Steps

After setting up the database:

1. Start the development server:
   ```bash
   cd client
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Login with:
   - Username: `kwaku`
   - Password: `korankye`
   - OTP: `123456`

4. You'll be redirected to `/configure` where you can create your first scraping job!
