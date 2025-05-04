import { type YouOweEntity } from '@/entities/entity'

// Bear in blue house, mouse guy

/** Table name corresponding to the Groups entity */
export const TABLE_NAME = 'groups'

/**
 * Mapping of the "groups" table in the Database.
 */
interface Group extends YouOweEntity {
  /**
   * Name of the Group.
   */
  name: string

  /**
   * Optional - Password required to join the Group.
   */
  password?: string | null

  /**
   * ID of the Member entity who created the Group.
   */
  creator_member_id: string
  
  /**
   * Date the Group was created.
   */
  created_at: Date

  /**
   * Date the Group was updated.
   */
  updated_at: Date

  /**
   * Date the Group was deleted.
   */
  deleted_at: Date | null

  /**
   * Boolean deciding whether new Members can join the Group or not.
   * True - Members can join the Group.
   * False - Members can't join the Group.
   */
  is_closed: boolean
}

export type { Group }
