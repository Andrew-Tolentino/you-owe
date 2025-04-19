/**
 * DTO that can be used to create a Group.
 */
interface NewGroupDTO {
  /**
   * Name of the new Group.
   */
  name: string

  /**
   * Optional - Password to join the new Group.
   * If not set, any Member can join the Group.
   */
  password?: string | null

  /**
   * Optional - There are other ways of creating a Group where the Member ID is not needed (new user creating a Group for the first time).
   * ID of Member who is creating the Group.
   */
  creator_member_id?: string
}

export type { NewGroupDTO }
