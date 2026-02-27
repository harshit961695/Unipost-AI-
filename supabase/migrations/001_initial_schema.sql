-- UniPost AI Database Schema
-- This migration creates all necessary tables for the SaaS platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Platform Accounts Table
-- Stores connected social media platform accounts for each user
CREATE TABLE IF NOT EXISTS platform_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- 'instagram', 'twitter', 'linkedin', 'facebook', 'youtube'
  platform_user_id VARCHAR(255), -- External platform user ID
  platform_username VARCHAR(255),
  access_token TEXT, -- Encrypted in production
  refresh_token TEXT, -- Encrypted in production
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Posts Table
-- Main table for storing all posts (drafts, scheduled, published)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(500),
  caption TEXT NOT NULL,
  media_urls TEXT[], -- Array of media URLs
  platforms TEXT[] NOT NULL, -- Array of platform IDs: ['instagram', 'twitter']
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'publishing', 'published', 'failed'
  scheduled_at TIMESTAMPTZ, -- When to publish (null for immediate or drafts)
  published_at TIMESTAMPTZ, -- When actually published
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb -- Additional data: timezone, retry count, etc.
);

-- Post Logs Table
-- Audit trail for all post operations and status changes
CREATE TABLE IF NOT EXISTS post_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'saved_draft', 'scheduled', 'published', 'failed', 'status_changed'
  platform VARCHAR(50), -- Which platform this log entry relates to
  status_before VARCHAR(20),
  status_after VARCHAR(20),
  message TEXT,
  error_details JSONB, -- Error info if action failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Table (for future real API integration)
-- Stores analytics data per post per platform
CREATE TABLE IF NOT EXISTS post_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, platform)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_logs_post_id ON post_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_post_logs_user_id ON post_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_accounts_user_id ON platform_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_accounts_platform ON platform_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_post_analytics_post_id ON post_analytics(post_id);

-- Row Level Security (RLS) Policies
ALTER TABLE platform_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own platform accounts"
  ON platform_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own platform accounts"
  ON platform_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own platform accounts"
  ON platform_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own post logs"
  ON post_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own post logs"
  ON post_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics"
  ON post_analytics FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM posts WHERE id = post_analytics.post_id));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_platform_accounts_updated_at
  BEFORE UPDATE ON platform_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_analytics_updated_at
  BEFORE UPDATE ON post_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
