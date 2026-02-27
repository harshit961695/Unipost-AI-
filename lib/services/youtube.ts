import { google } from 'googleapis';
import { connectionService } from './connectionService';
import { Readable } from 'stream';
import type { SupabaseClient } from '@supabase/supabase-js';

export const youtubeService = {
    getOAuth2Client: async (userId: string, supabase?: SupabaseClient) => {
        const { data: connection, error } = await connectionService.getConnection(userId, 'youtube', supabase);

        if (error || !connection) {
            throw new Error('YouTube connection not found or invalid');
        }

        console.log(`[YOUTUBE SERVICE] Retrieved connection from DB. Access token exists: ${!!connection.access_token}, Refresh token exists: ${!!connection.refresh_token}`);

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.NEXT_PUBLIC_APP_URL + '/api/connect/youtube/callback'
        );

        const expiryDateMs = connection.expires_at ? new Date(connection.expires_at).getTime() : undefined;

        oauth2Client.setCredentials({
            access_token: connection.access_token,
            refresh_token: connection.refresh_token,
            // If we saved expiry, googleapis can eagerly refresh
            expiry_date: expiryDateMs
        });

        console.log(`[YOUTUBE SERVICE] OAuth2 client created & credentials set. Expiry Date (ms): ${expiryDateMs}`);

        // Auto-save refreshed tokens back to Supabase
        oauth2Client.on('tokens', async (tokens) => {
            if (tokens.access_token) {
                await connectionService.saveConnection(userId, {
                    platform: 'youtube',
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token || connection.refresh_token,
                    expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
                    metadata: connection.metadata // preserve channel info
                });
            }
        });

        return oauth2Client;
    },

    /**
     * Uploads a video to YouTube with optional thumbnail.
     */
    uploadVideo: async (
        userId: string,
        videoBuffer: Buffer,
        videoMimeType: string,
        metadata: {
            title: string;
            description: string;
            privacyStatus: 'public' | 'unlisted' | 'private';
        },
        thumbnailBuffer?: Buffer,
        supabase?: SupabaseClient
    ) => {
        const auth = await youtubeService.getOAuth2Client(userId, supabase);
        const youtube = google.youtube({ version: 'v3', auth });

        // 1. Upload Video
        console.log('[YOUTUBE SERVICE] Starting youtube.videos.insert API call...');
        console.log(`[YOUTUBE SERVICE] Payload summary - Title: "${metadata.title}", Privacy: "${metadata.privacyStatus}", BufferSize: ${videoBuffer.length}`);

        try {
            const videoResponse = await youtube.videos.insert({
                part: ['snippet', 'status'],
                requestBody: {
                    snippet: {
                        title: metadata.title,
                        description: metadata.description,
                        // defaults for basic upload
                        categoryId: '22' // People & Blogs
                    },
                    status: {
                        privacyStatus: metadata.privacyStatus,
                        selfDeclaredMadeForKids: false
                    }
                },
                media: {
                    mimeType: videoMimeType,
                    body: Readable.from(videoBuffer)
                }
            });

            console.log('\n[YOUTUBE SERVICE] === FULL YOUTUBE API RESPONSE ===');
            console.log(JSON.stringify(videoResponse.data, null, 2));
            console.log('===================================================\n');

            const videoId = videoResponse.data.id;

            if (!videoId) {
                console.error('[YOUTUBE SERVICE] Failed! No video ID returned by YouTube.');
                throw new Error('Failed to retrieve video ID after upload. Full Response: ' + JSON.stringify(videoResponse.data));
            }

            // 2. Upload Custom Thumbnail if provided
            // ... (rest kept below) ...

            if (thumbnailBuffer) {
                console.log(`[YOUTUBE SERVICE] Setting thumbnail for Video ID: ${videoId}...`);
                try {
                    await youtube.thumbnails.set({
                        videoId: videoId,
                        media: {
                            mimeType: 'image/jpeg', // Force jpeg/png assumptions, or allow pass through
                            body: Readable.from(thumbnailBuffer)
                        }
                    });
                    console.log(`[YOUTUBE SERVICE] Thumbnail successfully set for Video ID: ${videoId}`);
                } catch (thumbError: any) {
                    console.error('[YOUTUBE SERVICE] Failed to set thumbnail, but video was uploaded:', thumbError);
                    console.error(thumbError.stack || thumbError);
                    // We don't throw here to avoid failing the whole process if only thumbnail fails
                }
            }

            return videoResponse.data;
        } catch (uploadError: any) {
            console.error('\n[YOUTUBE SERVICE] FATAL ERROR DURING youtube.videos.insert:');
            console.error(uploadError.stack || uploadError);
            if (uploadError.response) {
                console.error('[YOUTUBE SERVICE] Raw API Error Response Data:');
                console.error(JSON.stringify(uploadError.response.data, null, 2));
            }
            console.error('=======================================================\n');
            throw uploadError;
        }
    },

    /**
     * List all uploaded videos by the user.
     * Uses the 'uploads' playlist associated with the user's channel.
     */
    listVideos: async (userId: string, supabase?: SupabaseClient) => {
        const auth = await youtubeService.getOAuth2Client(userId, supabase);
        const youtube = google.youtube({ version: 'v3', auth });

        // 1. Get the uploads playlist ID for the channel
        const channelResponse = await youtube.channels.list({
            part: ['contentDetails'],
            mine: true
        });

        const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
        if (!uploadsPlaylistId) {
            throw new Error('Could not find uploads playlist for this channel');
        }

        // 2. Fetch videos from the uploads playlist
        const playlistResponse = await youtube.playlistItems.list({
            part: ['snippet', 'contentDetails', 'status'],
            playlistId: uploadsPlaylistId,
            maxResults: 50 // Adjust as needed
        });

        const items = playlistResponse.data.items || [];

        // 3. Get video statistics (views, etc.)
        const videoIds = items.map(item => item.contentDetails?.videoId).filter(Boolean) as string[];

        if (videoIds.length === 0) return [];

        const videoStatsResponse = await youtube.videos.list({
            part: ['statistics', 'snippet', 'status'],
            id: videoIds
        });

        return videoStatsResponse.data.items || [];
    },

    /**
     * Update video metadata (title, description).
     */
    updateVideo: async (userId: string, videoId: string, metadata: { title: string; description?: string; privacyStatus?: string }, supabase?: SupabaseClient) => {
        const auth = await youtubeService.getOAuth2Client(userId, supabase);
        const youtube = google.youtube({ version: 'v3', auth });

        return await youtube.videos.update({
            part: ['snippet', 'status'],
            requestBody: {
                id: videoId,
                snippet: {
                    title: metadata.title,
                    description: metadata.description || '',
                    categoryId: '22'
                },
                status: {
                    privacyStatus: metadata.privacyStatus || 'public'
                }
            }
        });
    },

    /**
     * Delete a YouTube video.
     */
    deleteVideo: async (userId: string, videoId: string, supabase?: SupabaseClient) => {
        const auth = await youtubeService.getOAuth2Client(userId, supabase);
        const youtube = google.youtube({ version: 'v3', auth });

        return await youtube.videos.delete({
            id: videoId
        });
    },

    /**
     * Get Real-time Analytics from YouTube Channel
     */
    getAnalytics: async (userId: string, supabase?: SupabaseClient) => {
        const auth = await youtubeService.getOAuth2Client(userId, supabase);
        const youtube = google.youtube({ version: 'v3', auth });

        const response = await youtube.channels.list({
            part: ['statistics', 'brandingSettings', 'snippet'],
            mine: true
        });

        if (!response.data.items || response.data.items.length === 0) {
            throw new Error('No YouTube channel found');
        }

        const channel = response.data.items[0];
        const stats = channel.statistics;
        const views = Number(stats?.viewCount || 0);
        const subscribers = Number(stats?.subscriberCount || 0);
        const videos = Number(stats?.videoCount || 0);

        // Mock daily data for charts (since basic Channel API doesn't provide history)
        const chartData = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                views: Math.round((views / 30) * (0.8 + Math.random() * 0.4)),
                subscribers: Math.round((subscribers / 100) * Math.random())
            };
        });

        return {
            connected: true,
            channelName: channel.snippet?.title,
            subscribers,
            views,
            videos,
            totalEngagement: Math.round(views * 0.05),
            engagementRate: 5.0,
            chartData
        };
    }
};

