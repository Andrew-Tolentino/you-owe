import { TABLE_NAME as MembersTable } from '@/entities/member'
import { TABLE_NAME as GroupsTable } from '@/entities/groups'

/** Join table name for Members and Groups entities */
export const MEMBERS_GROUPS_JOIN_TABLE = `${MembersTable}_${GroupsTable}`
