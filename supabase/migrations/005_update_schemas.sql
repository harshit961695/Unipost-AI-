-- Add missing platform_post_id to post_logs
ALTER TABLE public.post_logs 
ADD COLUMN IF NOT EXISTS platform_post_id TEXT;

-- Restructure analytics_snapshots for granular integer numbers
ALTER TABLE public.analytics_snapshots 
DROP COLUMN IF EXISTS snapshot_data;

ALTER TABLE public.analytics_snapshots 
ADD COLUMN IF NOT EXISTS total_reach INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_impressions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_engagement INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_comments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
