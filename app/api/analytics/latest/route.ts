export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const supabase = createSupabaseServerClient();

        // Check if user has connected any accounts
        const { count: accountCount, error: accountError } = await supabase
            .from('connected_accounts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (accountError) throw accountError;

        const { data, error } = await supabase
            .from('analytics_snapshots')
            .select('*')
            .eq('user_id', user.id)
            .order('snapshot_date', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
            throw error;
        }

        // Also fetch historical for charts (last 7 or so)
        const { data: historyData } = await supabase
            .from('analytics_snapshots')
            .select('*')
            .eq('user_id', user.id)
            .order('snapshot_date', { ascending: true })
            // Limit to last 20 for simple charting
            .limit(20);

        // Logging exactly what user requested
        console.log(`[ANALYTICS] User: ${user.id} | Accounts: ${accountCount} | Snapshots: ${historyData?.length || 0}`);

        return NextResponse.json({
            success: true,
            hasAccounts: (accountCount || 0) > 0,
            latest: data || null,
            lastUpdated: data ? data.snapshot_date : null,
            history: historyData || []
        });

    } catch (error: any) {
        console.error('[ANALYTICS DB FETCH] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch snapshot' }, { status: 500 });
    }
}
