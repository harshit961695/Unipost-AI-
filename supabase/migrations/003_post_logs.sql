-- Create post_logs table to track multi-platform publishing attempts
CREATE TABLE public.post_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.post_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own logs
CREATE POLICY "Users can view their own post logs" 
    ON public.post_logs 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Create policy for users to insert their own logs
CREATE POLICY "Users can insert their own post logs" 
    ON public.post_logs 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
