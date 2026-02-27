export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
// Need longer max duration for cron potentially. Vercel hobby limits to 10s or 60s, Pro 300s.
export const maxDuration = 60; // Set to 60s as a safe baseline

export async function GET(request: NextRequest) {
    try {
        // 1. Authenticate the Cron Request
        // --- TEMPORARILY DISABLED FOR LOCAL DEBUGGING ---
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     console.error('[CRON ERROR] Unauthorized attempt to run fetch-analytics');
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }
        // ------------------------------------------------

        console.log(`[CRON LOG] Starting global granular analytics fetch...`);

        // 2. Initialize Service Role Supabase Client to bypass RLS
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase Environment Variables for Cron execution');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false, autoRefreshToken: false }
        });

        // 3. Fetch all active connected accounts across the entire platform
        const { data: accounts, error: accountsError } = await supabase
            .from('connected_accounts')
            .select('*')
            .neq('access_token', '');

        if (accountsError) throw accountsError;
        const allConnectedAccounts = accounts || [];

        if (allConnectedAccounts.length === 0) {
            console.log('[CRON LOG] No connected accounts found globally.');
            return NextResponse.json({ success: true, processed_users: 0, platforms_checked: [] });
        }

        // Group accounts by user_id
        const usersAccountsMap: Record<string, any[]> = {};
        allConnectedAccounts.forEach(acc => {
            if (!usersAccountsMap[acc.user_id]) usersAccountsMap[acc.user_id] = [];
            usersAccountsMap[acc.user_id].push(acc);
        });

        const userIds = Object.keys(usersAccountsMap);
        let processedUsersCount = 0;
        const platformsChecked = new Set<string>();

        // 4. Fetch all successful post logs globally
        const { data: posts, error: postsError } = await supabase
            .from('post_logs')
            .select('*')
            .in('user_id', userIds)
            .eq('status', 'success')
            .not('platform_post_id', 'is', null);

        if (postsError) throw postsError;
        const allPostLogs = posts || [];

        // Group post logs by user_id
        const usersPostLogsMap: Record<string, any[]> = {};
        allPostLogs.forEach(post => {
            if (!usersPostLogsMap[post.user_id]) usersPostLogsMap[post.user_id] = [];
            usersPostLogsMap[post.user_id].push(post);
        });

        // 5. Process EACH user independently
        for (const userId of userIds) {
            try {
                const userAccounts = usersAccountsMap[userId];
                const userPostLogs = usersPostLogsMap[userId] || [];

                if (userPostLogs.length === 0) continue; // Skip if no successful posts

                // Map tokens for this user
                const tokenMap: Record<string, string> = {};
                userAccounts.forEach(acc => {
                    tokenMap[acc.platform] = acc.access_token;
                    platformsChecked.add(acc.platform);
                });

                let totalReach = 0;
                let totalImpressions = 0;
                let totalEngagement = 0;
                let totalViews = 0;
                let totalLikes = 0;
                let totalComments = 0;

                // Process all posts for this user
                const promises = userPostLogs.map(async (post) => {
                    const platform = post.platform;
                    const postId = post.platform_post_id;
                    const token = tokenMap[platform];

                    if (!token || !postId) return;

                    try {
                        if (platform === 'facebook') {
                            // Fetch FB Post Insights
                            const url = `https://graph.facebook.com/v25.0/${postId}/insights?metric=post_impressions,post_impressions_unique,post_engaged_users&access_token=${token}`;
                            const res = await fetch(url);
                            const data = await res.json();

                            if (!data.error) {
                                data.data?.forEach((insight: any) => {
                                    const val = insight.values?.[0]?.value || 0;
                                    if (insight.name === 'post_impressions') totalImpressions += val;
                                    if (insight.name === 'post_impressions_unique') totalReach += val;
                                    if (insight.name === 'post_engaged_users') totalEngagement += val;
                                });
                            }

                            // Fetch likes and comments count
                            const engagementsUrl = `https://graph.facebook.com/v25.0/${postId}?fields=likes.summary(true),comments.summary(true)&access_token=${token}`;
                            const engRes = await fetch(engagementsUrl);
                            const engData = await engRes.json();

                            const postLikes = engData.likes?.summary?.total_count || 0;
                            const postComments = engData.comments?.summary?.total_count || 0;

                            totalLikes += postLikes;
                            totalComments += postComments;

                        } else if (platform === 'instagram') {
                            // Fetch IG Media Insights
                            const url = `https://graph.facebook.com/v25.0/${postId}/insights?metric=impressions,reach,engagement,saved,video_views&access_token=${token}`;
                            const res = await fetch(url);
                            const data = await res.json();

                            let foundMetric = false;

                            if (data.data) {
                                data.data.forEach((insight: any) => {
                                    const val = insight.values?.[0]?.value || 0;
                                    if (insight.name === 'impressions') { totalImpressions += val; foundMetric = true; }
                                    if (insight.name === 'reach') { totalReach += val; foundMetric = true; }
                                    if (insight.name === 'engagement') { totalEngagement += val; foundMetric = true; }
                                });
                            }

                            // Fallback to basic fields if insights fail
                            const basicUrl = `https://graph.facebook.com/v25.0/${postId}?fields=like_count,comments_count,media_type&access_token=${token}`;
                            const basicRes = await fetch(basicUrl);
                            const basicData = await basicRes.json();

                            const postLikes = basicData.like_count || 0;
                            const postComments = basicData.comments_count || 0;

                            totalLikes += postLikes;
                            totalComments += postComments;

                            if (!foundMetric) {
                                totalEngagement += (postLikes + postComments);
                            }

                        } else if (platform === 'youtube') {
                            // Fetch YT Video Stats
                            const url = `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${postId}`;
                            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                            const data = await res.json();

                            if (data.items && data.items.length > 0) {
                                const stats = data.items[0].statistics;
                                const views = Number(stats.viewCount || 0);
                                const likes = Number(stats.likeCount || 0);
                                const comments = Number(stats.commentCount || 0);

                                totalViews += views;
                                totalLikes += likes;
                                totalComments += comments;

                                totalImpressions += views;
                                totalReach += views;
                                totalEngagement += (likes + comments);
                            }
                        }
                    } catch (err: any) {
                        console.error(`[CRON LOG] Error fetching per-post analytics for user ${userId}, ${platform} post ${postId}:`, err);
                    }
                });

                // Wait for all posts for this user to resolve
                await Promise.allSettled(promises);

                // Insert into analytics_snapshots for this individual user
                const { error: insertError } = await supabase
                    .from('analytics_snapshots')
                    .insert({
                        user_id: userId,
                        total_reach: totalReach,
                        total_impressions: totalImpressions,
                        total_engagement: totalEngagement,
                        total_views: totalViews,
                        total_likes: totalLikes,
                        total_comments: totalComments
                        // snapshot_date defaults to NOW() via Postgres constraint
                    });

                if (insertError) {
                    console.error(`[CRON LOG] DB Insert Error for user ${userId}:`, insertError);
                } else {
                    processedUsersCount++;
                }
            } catch (userErr) {
                console.error(`[CRON LOG] Failed processing user ${userId}:`, userErr);
                // Keep processing other users even if one fails
            }
        } // end foreach user

        console.log(`[CRON LOG] Global fetch complete. Processed ${processedUsersCount} users.`);

        return NextResponse.json({
            success: true,
            processed_users: processedUsersCount,
            platforms_checked: Array.from(platformsChecked)
        });

    } catch (error: any) {
        console.error('[CRON LOG] Fatal Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to execute cron analytics fetch' }, { status: 500 });
    }
}
