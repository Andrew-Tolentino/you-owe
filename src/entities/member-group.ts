import { YouOweEntity } from '@/entities/entity'
import { TABLE_NAME as MembersTable } from '@/entities/member'
import { TABLE_NAME as GroupsTable } from '@/entities/group'

const TABLE_NAME = `${MembersTable}_${GroupsTable}`

/**
 * Mapping of the members_groups join table.
 */
interface MemberGroup extends YouOweEntity {
  /**
   * ID of the Member belonging to a Group.
   */
  member_id: string

  /**
   * ID of a Group, Members belong to.
   */
  group_id: string
}

export { type MemberGroup, TABLE_NAME }
