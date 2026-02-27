-- Create analytics_snapshots table to store historical data

CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    snapshot_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on Row Level Security
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see only their own snapshots
CREATE POLICY "Users can view own analytics snapshots"
ON public.analytics_snapshots
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own snapshots (via API primarily)
CREATE POLICY "Users can insert own analytics snapshots"
ON public.analytics_snapshots
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own snapshots (optional cleanup)
CREATE POLICY "Users can delete own analytics snapshots"
ON public.analytics_snapshots
FOR DELETE
USING (auth.uid() = user_id);
