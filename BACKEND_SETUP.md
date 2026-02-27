# UniPost AI - Backend Setup Guide

This document explains the backend infrastructure that has been implemented.

## Database Setup (STEP 1)

### Supabase Migration

Run the migration file to create all necessary tables:

```sql
-- File: supabase/migrations/001_initial_schema.sql
```

**Tables Created:**
- `platform_accounts` - Connected social media accounts
- `posts` - All posts (drafts, scheduled, published)
- `post_logs` - Audit trail for all post operations
- `post_analytics` - Analytics data per post per platform

**To apply migration:**
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Execute the migration

**Row Level Security (RLS):**
- All tables have RLS enabled
- Users can only access their own data
- Policies are automatically enforced

## API Routes (STEP 2)

### Posts API

**GET /api/posts**
- List all posts for authenticated user
- Query params: `status`, `limit`, `offset`

**POST /api/posts**
- Create new post or save as draft
- Body: `{ caption, platforms, title?, media_urls?, scheduled_at?, status? }`

**GET /api/posts/[id]**
- Get single post by ID

**PATCH /api/posts/[id]**
- Update post (save draft, reschedule, change status)
- Body: `{ caption?, platforms?, title?, media_urls?, scheduled_at?, status? }`

**DELETE /api/posts/[id]**
- Delete a post

**POST /api/posts/[id]/publish**
- Publish a post immediately (simulation)
- Returns publish results for each platform

### Authentication

All API routes require authentication. The system extracts auth tokens from:
1. `Authorization: Bearer <token>` header
2. Supabase auth cookies

## Scheduler Service (STEP 3)

**POST /api/cron/schedule-posts**
- Processes scheduled posts that are due
- Should be called periodically (every minute recommended)

**Setup Options:**

1. **Vercel Cron Jobs** (if deployed on Vercel):
   Add to `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/cron/schedule-posts",
       "schedule": "* * * * *"
     }]
   }
   ```

2. **External Cron Service:**
   - Use cron-job.org or similar
   - Set to call: `https://your-domain.com/api/cron/schedule-posts`
   - Frequency: Every minute
   - Method: POST
   - Optional: Add `Authorization: Bearer <CRON_SECRET>` header if CRON_SECRET is set

3. **Manual Testing:**
   ```bash
   curl -X POST https://your-domain.com/api/cron/schedule-posts
   ```

**Security:**
- Set `CRON_SECRET` environment variable
- Add `Authorization: Bearer <CRON_SECRET>` header to cron requests

## AI Caption Generation (STEP 4)

**POST /api/ai/caption**
- Generates social media captions using Google Gemini
- Features:
  - Automatic retry on failure (one retry)
  - Graceful fallback with default caption
  - Never throws unhandled errors

**Request:**
```json
{
  "prompt": "Your content idea here"
}
```

**Response:**
```json
{
  "caption": "Generated caption text...",
  "fallback": false
}
```

**Environment Variable:**
- `GEMINI_API_KEY` - Required for AI generation

## Error Handling (STEP 5)

**Global Error Handler:**
- `lib/api/error-handler.ts` - Utility functions for consistent error handling
- `middleware.ts` - Next.js middleware for request/response processing
- All API routes catch errors and return standardized responses

**Error Response Format:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE" // Optional
}
```

## Analytics API (STEP 6)

**GET /api/analytics**
- Returns analytics data based on stored posts
- Query params: `period` (7d, 30d, 90d, all), `platform` (optional)

**Response Structure:**
```json
{
  "summary": {
    "totalPosts": 10,
    "totalViews": 50000,
    "totalLikes": 2500,
    "totalComments": 150,
    "totalShares": 300,
    "averageEngagementRate": 5.9,
    "totalReach": 50000
  },
  "platformBreakdown": {
    "instagram": { ... },
    "twitter": { ... }
  },
  "recentPosts": [ ... ],
  "trends": {
    "views": [ ... ],
    "engagement": [ ... ]
  }
}
```

**Features:**
- Deterministic analytics (same post = same metrics)
- Non-zero values (minimum thresholds)
- Calculated from actual post data
- Ready for real API integration

## Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI
GEMINI_API_KEY=your_gemini_api_key

# Optional
CRON_SECRET=your_cron_secret_for_scheduler
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Post Status Flow

1. **draft** → Can become `scheduled` or `published`
2. **scheduled** → Auto-transitions to `publishing` when time arrives
3. **publishing** → Transitions to `published` or `failed`
4. **published** → Final state (cannot be modified)
5. **failed** → Can be retried (back to `draft` or `scheduled`)

## Testing

### Test Post Creation:
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "caption": "Test post",
    "platforms": ["instagram", "twitter"],
    "status": "draft"
  }'
```

### Test Publishing:
```bash
curl -X POST http://localhost:3000/api/posts/<post-id>/publish \
  -H "Authorization: Bearer <token>"
```

### Test Analytics:
```bash
curl http://localhost:3000/api/analytics?period=30d \
  -H "Authorization: Bearer <token>"
```

## Notes

- All database operations use Row Level Security (RLS)
- All API routes require authentication
- Error handling is consistent across all endpoints
- Scheduler runs independently and doesn't affect UI
- Analytics are deterministic and based on actual post data
- AI caption generation always returns a response (fallback if needed)
