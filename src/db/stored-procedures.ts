/**
 * Creates a new Member, a new Group, and then a new entry in the MembersGroups junction table.
 * The purpose of this stored procedure is for new users to create a Group (which by doing so will create a Member too).
 * 
 * @returns {string} new Group ID created.
 */
const PROC_CREATE_NEW_MEMBER_AND_GROUP = 'create_new_member_and_group'
interface ProcCreateNewMemberAndGroup {
  /**
   * The name of the new Member the user will associated to.
   */
  member_name: string

  /**
   * The name for the Group the user will create.
   */
  group_name: string

  /**
   * Optional - The password the user wishes to set for the Group.
   * 
   */
  group_password: string | null

  /**
   * The Supabase auth_id associated to the user.
   */
  auth_user_id: string
}

export { PROC_CREATE_NEW_MEMBER_AND_GROUP, type ProcCreateNewMemberAndGroup }
