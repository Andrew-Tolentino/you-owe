import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { DBClient } from '@/db/db-client'
import { YouOweEntity } from '@/entities/entity'

/**
 * Singleton Supabase Client.
 */
// The enviroment variables should not be null so "non-null assertion operator (!)"
const client: SupabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

class SupaBaseClient implements DBClient {
  
  /**
   * Uses the Supabase client to get a row from a table given a unique ID.
   * 
   * @param {string} tableName - Table to get a row from 
   * @param {string} id - Unique ID associated to the row 
   * @returns {Promise<YouOweEntity | null>} - The row found in the table. If nothing is found, returns null.
   */
  async getEntityById(tableName: string, id: string): Promise<YouOweEntity | null> {
    const { data, error } = await client.from(tableName).select().eq('id', id)

    // Log this
    if (error) {
      return null
    }

    // Log this
    if (data.length === 0) {
      return null
    }

    return data[0] as YouOweEntity
  }

  /**
   * Uses the Supabase client to make an insertion into a table.
   * 
   * @param {string} tableName - Table to create a new entity in.
   * @param {YouOweEntity} entity - Object representing the new row that will be inserted into the table.
   * 
   * @returns {Promise<YouOweEntity | null>} - If successful, returns the entity returned from Supabase. If not, returns null.
   */
  async createEntityById(tableName: string, entity: YouOweEntity): Promise<YouOweEntity | null> {
    const { data, error } =  await client.from(tableName).insert(entity)

    // Log this
    if (error) {
      return null
    }

      
    console.log('data', data)
    return entity
  }

  /**
   * Uses the Supabase client to soft delete a row in a table. This will pooulate the 'deleted_at' column in the row.
   * 
   * @param {string} tableName - Table to delete a row from 
   * @param {string} id - Unique ID associated to the row 
   * @returns {Promise<boolean>} whether or not we were able to soft delete the row.
   */
  async deleteEntityById(tableName: string, id: string): Promise<boolean> {
    const date = new Date(Date.now())
    const { error } = await client.from(tableName).update({ 'deleted_at':  date.toISOString() }).eq('id', id)

    // Log this
    if (error) {
      return false
    }

    return true
  }
}

/** Default export which uses only one instance of SupaBaseClient. */
const singletonSupaBaseClient =  new SupaBaseClient()
export default singletonSupaBaseClient
