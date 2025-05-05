/**
 * DTO that can be use to create a new Member.
 */
interface NewMemberDTO {
  /**
   * The name of the new Member.
   */
  name: string

  /**
   * Optional - There are other ways of creating a Member where the Group ID is not needed (new user creating a Group for the first time).
   * 
   * ID of the Group the new Member will join.
   * For now, every Member in the Database will be associated to a Group.
   */
  group_id?: string

  /**
   * Optional - If the Group the user wishes to join has a Password 
   * then this field is required.
   */
  group_password?: string
}

export type { NewMemberDTO }
