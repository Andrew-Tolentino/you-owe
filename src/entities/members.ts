import { type YouOweEntity } from '@/entities/entity';

export const TABLE_NAME = 'members'

/**
 * Mapping  of the "members" table in the Database.
 */
interface Members extends YouOweEntity {
  /**
   * Name of the Member.
   */
  name: string

  /**
   * Date the Member was created.
   */
  created_at: Date

  /**
   * Date the Member was deleted.
   */
  deleted_at: Date | null

  /**
   * Supabase's own user ID linking the actual Supabase User to the business Member entity.
   */
  auth_user_id: string
}

export type { Members }
