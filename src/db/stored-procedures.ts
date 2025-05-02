// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type Member } from '@/entities/member'

/**
 * Creates a new Member and then a new Group with that Member as the Group's creator.
 * The purpose of this stored procedure is for new users to create a Group (which by doing so will create a Member too).
 * 
 * @param {ProcCreateNewMemberAndGroup} ProcCreateNewMemberAndGroup
 * @returns {ProcCreateNewMemberAndGroupQuery[]} ProcCreateNewMemberAndGroupQuery[]
 */
const PROC_CREATE_NEW_MEMBER_AND_GROUP = 'create_new_member_and_group'

/**
 * PROC_CREATE_NEW_MEMBER_AND_GROUP - Parameters
 */
interface ProcCreateNewMemberAndGroupParameters {
  /**
   * The name of the new Member the user will associated to.
   */
  new_member_name: string

  /**
   * The name for the Group the user will create.
   */
  new_group_name: string

  /**
   * Optional - The password the user wishes to set for the Group.
   * 
   */
  new_group_password: string | null

  /**
   * The Supabase auth_id associated to the user.
   */
  auth_user_id: string
}

/**
 * PROC_CREATE_NEW_MEMBER_AND_GROUP - Returning query mapping
 */
interface ProcCreateNewMemberAndGroupQuery {
  /**
   * ID of the newly created Member.
   */
  member_id: string

  /**
   * Name of the newly created Member.
   */
  member_name: string

  /**
   * Date the Member was created.
   */
  member_created_at: Date

  /**
   * ID of the newly created Group.
   */
  group_id: string

  /**
   * Name of the newly created Group.
   */
  group_name: string

  /**
   * Date the Group was created.
   */
  group_created_at: Date
}
export { PROC_CREATE_NEW_MEMBER_AND_GROUP, type ProcCreateNewMemberAndGroupParameters, type ProcCreateNewMemberAndGroupQuery }


/**
 * Creates a new Member and then links them to an existing Group.
 * 
 * @param {ProcCreateNewMemberAndLinkToMemberGroups} ProcCreateNewMemberAndLinkToMemberGroups
 * @returns {Members[]} Members[]
 */
const PROC_CREATE_NEW_MEMBER_AND_LINK_TO_MEMBERS_GROUPS = 'create_new_member_and_link_to_members_groups'

/**
 * PROC_CREATE_NEW_MEMBER_AND_LINK_TO_MEMBERS_GROUPS - Parameters
 */
interface ProcCreateNewMemberAndLinkToMemberGroups {
  /**
   * The name of the new Member the user will associated to.
   */
  member_name: string

  /**
   * The ID of the existing Group the new Member will Join
   */
  group_id: string

  /**
   * The Supabase auth_id associated to the user.
   */
  auth_user_id: string
}
export { PROC_CREATE_NEW_MEMBER_AND_LINK_TO_MEMBERS_GROUPS, type ProcCreateNewMemberAndLinkToMemberGroups }
