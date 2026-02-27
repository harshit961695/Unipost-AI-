import { supabaseServer } from '@/lib/supabase/server'
import { ServiceResponse } from './supabaseService'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ConnectionPlatform = 'youtube' | 'instagram' | 'facebook' | 'twitter' | 'linkedin'

export const connectionService = {
    /**
     * Save or update a connected account
     */
    async saveConnection(userId: string, data: {
        platform: ConnectionPlatform
        accessToken: string
        refreshToken?: string
        expiresAt?: Date
        pageId?: string
        instagramBusinessId?: string
        metadata?: any
    }, client?: SupabaseClient): Promise<ServiceResponse<any>> {
        try {
            const db = client ?? supabaseServer

            // 1. Check if connection exists
            const { data: existing } = await db
                .from('connected_accounts')
                .select('id')
                .eq('user_id', userId)
                .eq('platform', data.platform)
                .limit(1)

            const existingArray = existing as any[] | null
            const existingRecord = existingArray && existingArray.length > 0 ? existingArray[0] : null

            const connectionData = {
                user_id: userId,
                platform: data.platform,
                access_token: data.accessToken,
                refresh_token: data.refreshToken,
                expires_at: data.expiresAt ? data.expiresAt.getTime() : null,
                page_id: data.pageId || null,
                instagram_business_id: data.instagramBusinessId || null,
                metadata: data.metadata || {}
            }

            let result;
            if (existingRecord) {
                result = await db
                    .from('connected_accounts')
                    .update(connectionData)
                    .eq('id', existingRecord.id)
                    .select()
            } else {
                result = await db
                    .from('connected_accounts')
                    .insert(connectionData)
                    .select()
            }

            if (result.error) throw result.error
            const finalData = result.data && result.data.length > 0 ? result.data[0] : null;
            return { data: finalData, error: null }
        } catch (error: any) {
            console.error('ConnectionService saveConnection error:', error)
            return { data: null, error: error.message }
        }
    },

    /**
     * Get a specific connection for a user.
     * Pass an authenticated `client` (created via createSupabaseServerClient) so that
     * RLS policies on `connected_accounts` are satisfied.
     */
    async getConnection(userId: string, platform: ConnectionPlatform, client?: SupabaseClient): Promise<ServiceResponse<any>> {
        try {
            const db = client ?? supabaseServer
            console.log(`[CONNECTION SERVICE] getConnection: userId=${userId}, platform=${platform}, usingPassedClient=${!!client}`)

            const { data, error } = await db
                .from('connected_accounts')
                .select('*')
                .eq('user_id', userId)
                .eq('platform', platform)
                .neq('access_token', '')
                .limit(1)

            console.log(`[CONNECTION SERVICE] Raw Supabase result:`, {
                hasData: !!data && data.length > 0,
                errorCode: error?.code ?? null,
                errorMessage: error?.message ?? null,
            })

            if (error) {
                if (error.code === 'PGRST116') {
                    return { data: null, error: null }
                }
                throw error
            }

            if (!data || data.length === 0) {
                return { data: null, error: null }
            }

            return { data: data[0], error: null }
        } catch (error: any) {
            console.error('ConnectionService getConnection error:', error)
            return { data: null, error: error.message }
        }
    },


    /**
     * Disconnect an account (Soft delete / Update)
     */
    async disconnect(userId: string, platform: ConnectionPlatform, client?: SupabaseClient): Promise<ServiceResponse<boolean>> {
        try {
            // Using the authenticated client allows the user's specific JWT to pass through to Supabase
            // This satisfies the customized UPDATE Row Level Security policy.
            const db = client ?? supabaseServer

            const { data, error } = await db
                .from('connected_accounts')
                .update({
                    access_token: "",
                    refresh_token: "",
                    expires_at: null
                })
                .eq('user_id', userId)
                .eq('platform', platform)
                .select()

            if (error) throw error

            if (!data || data.length === 0) {
                console.warn(`[DISCONNECT] Update query ran successfully, but 0 rows were affected. (Possible RLS failure or already deleted)`)
            } else {
                console.log(`[DISCONNECT] Successfully updated/disconnected ${data.length} row(s) for ${platform}.`)
            }

            return { data: true, error: null }
        } catch (error: any) {
            console.error('ConnectionService disconnect error:', error)
            return { data: null, error: error.message }
        }
    },

    /**
     * List all connected accounts for a user
     */
    async listConnections(userId: string): Promise<ServiceResponse<any[]>> {
        try {
            const { data, error } = await supabaseServer
                .from('connected_accounts')
                .select('platform, metadata, created_at') // Exclude tokens for security
                .eq('user_id', userId)
                .neq('access_token', '')

            if (error) throw error
            return { data: data || [], error: null }
        } catch (error: any) {
            console.error('ConnectionService listConnections error:', error)
            return { data: null, error: error.message }
        }
    }
}
