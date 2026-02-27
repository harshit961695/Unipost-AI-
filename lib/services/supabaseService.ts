import { supabaseServer } from '@/lib/supabase/server'

export type ServiceResponse<T> = {
  data: T | null
  error: string | null
}

export const supabaseService = {
  /**
   * Get posts for a specific user
   */
  async getPosts(userId: string, options: { status?: string; limit?: number; offset?: number } = {}): Promise<ServiceResponse<any[]>> {
    try {
      let query = supabaseServer
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (options.status) {
        query = query.eq('status', options.status)
      }

      if (options.limit) {
        const from = options.offset || 0
        const to = from + options.limit - 1
        query = query.range(from, to)
      }

      const { data, error } = await query

      if (error) {
        console.error('SupabaseService getPosts error:', error)
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (err: any) {
      console.error('SupabaseService getPosts exception:', err)
      return { data: null, error: err.message || 'Unexpected database error' }
    }
  },

  /**
   * Create a new post
   */
  async createPost(postData: any): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabaseServer
        .from('posts')
        .insert(postData)
        .select()
        .single()

      if (error) {
        console.error('SupabaseService createPost error:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err: any) {
      console.error('SupabaseService createPost exception:', err)
      return { data: null, error: err.message || 'Unexpected database error' }
    }
  },

  /**
   * Log a post action
   */
  async logPostAction(logData: { post_id: string; user_id: string; action: string; status_after?: string; message: string }) {
    try {
      const { error } = await supabaseServer
        .from('post_logs')
        .insert(logData)
      
      if (error) {
        console.error('SupabaseService logPostAction error:', error)
      }
    } catch (err) {
      console.error('SupabaseService logPostAction exception:', err)
    }
  }
}
