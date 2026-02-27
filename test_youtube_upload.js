require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');
const fs = require('fs');
const { Readable } = require('stream');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
    console.log('--- STARTING YOUTUBE DIRECT UPLOAD TEST ---');

    // 1. Get the first user with a youtube connection
    const { data: connections, error: connError } = await supabase
        .from('connected_accounts')
        .select('user_id, access_token, refresh_token, expires_at')
        .eq('platform', 'youtube')
        .limit(1);

    if (connError || !connections || connections.length === 0) {
        console.error('Failed to find a YouTube connection in the database.', connError);
        return;
    }

    const connection = connections[0];
    console.log(`Found YouTube connection for user: ${connection.user_id}`);
    console.log(`Access Token present: ${!!connection.access_token}`);
    console.log(`Refresh Token present: ${!!connection.refresh_token}`);

    // 2. Init Google Auth
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.NEXT_PUBLIC_APP_URL + '/api/connect/youtube/callback'
    );

    oauth2Client.setCredentials({
        access_token: connection.access_token,
        refresh_token: connection.refresh_token,
        expiry_date: connection.expires_at ? Number(connection.expires_at) : undefined
    });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // 3. Read Test Video
    const videoBuffer = fs.readFileSync('test_vid.mp4');
    console.log(`Loaded test_vid.mp4. Size: ${videoBuffer.length} bytes`);

    // 4. Dispatch Upload
    console.log('Dispatching youtube.videos.insert...');
    try {
        const videoResponse = await youtube.videos.insert({
            part: ['snippet', 'status'],
            requestBody: {
                snippet: {
                    title: 'Direct API Test Short',
                    description: 'Testing the API connection via Node script bypass.',
                    categoryId: '22'
                },
                status: {
                    privacyStatus: 'private', // safe testing
                    selfDeclaredMadeForKids: false
                }
            },
            media: {
                mimeType: 'video/mp4',
                body: Readable.from(videoBuffer)
            }
        });

        console.log('\n=== SUCCESS: YOUTUBE API RESPONSE ===');
        console.log(JSON.stringify(videoResponse.data, null, 2));

    } catch (error) {
        console.error('\n=== ERROR: YOUTUBE API FAILED ===');
        console.error(error.message);
        if (error.response && error.response.data) {
            console.error('Google API Error Details:');
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error);
        }
    }
}

runTest();
