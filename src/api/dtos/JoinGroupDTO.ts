/**
 * DTO that can be use for an existing Member to join a Group
 */
interface JoinGroupDTO {
  /**
   * The ID of the Member to join a Group.
   */
  member_id: string

  /**
   * The ID of the Group the Member will join.
   */
  group_id: string

  /**
   * Optional - If the Group the user wishes to join has a Password 
   * then this field is required.
   * 
   */
  group_password?: string
}

export { type JoinGroupDTO }
