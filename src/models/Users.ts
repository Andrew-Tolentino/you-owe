import { supabaseCreateServerClient } from '@/api/clients/supabase/supabase-server-client'
import { SupabaseClient } from '@supabase/supabase-js'

export class Users {
  private _superbaseServerClient: SupabaseClient | null = null

  private async getSupabaseServerClient() {
    if (this._superbaseServerClient === null) {
      this._superbaseServerClient = await supabaseCreateServerClient()
    }

    return this._superbaseServerClient
  }

  /**
   * Fetches the ID associated to a User.
   * 
   * @returns {string | null} ID
   */
  async getAuthUserId(): Promise<string | null> {
    const superbaseClient = await this.getSupabaseServerClient()
    const { data: { user } } = await superbaseClient.auth.getUser()

    if (!user) {
      return null
    }

    return user.id
  }
}
