-- Create scraping_jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('Instagram', 'Threads', 'TikTok', 'X')),
  num_vas INTEGER NOT NULL CHECK (num_vas > 0),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'in_progress', 'completed', 'failed')),
  airtable_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on platform for faster queries
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_platform ON scraping_jobs(platform);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_created_at ON scraping_jobs(created_at DESC);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_scraping_jobs_updated_at ON scraping_jobs;
CREATE TRIGGER update_scraping_jobs_updated_at
  BEFORE UPDATE ON scraping_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (adjust based on your auth needs)
-- For public access (since you're using simple auth):
DROP POLICY IF EXISTS "Allow all operations on scraping_jobs" ON scraping_jobs;
CREATE POLICY "Allow all operations on scraping_jobs"
  ON scraping_jobs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert some sample data (optional, remove if not needed)
-- INSERT INTO scraping_jobs (influencer, platform, num_vas, status) VALUES
--   ('FitMomGhana', 'Instagram', 5, 'queued'),
--   ('AfricanFashionDaily', 'Threads', 3, 'in_progress'),
--   ('GhanaFoodie', 'TikTok', 2, 'completed');
