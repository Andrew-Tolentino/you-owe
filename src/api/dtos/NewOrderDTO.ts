/**
 * DTO that can be used to create an Order
 */
interface NewOrderDTO {
  /**
   * ID belonging to the Member who is creating the Order.
   */
  creator_member_id: string

  /**
   * ID belonging to the Group the Member is creating the Order for.
   */
  group_id: string

  /**
   * Name of the Order.
   */
  title: string

  /**
   * Optional
   * 
   * Note for the Order.
   */
  description?: string

  /**
   * The cost of the Order.
   */
  price: number

  /**
   * Optional
   * 
   * List Member IDs who are going to split the cost of the Order.
   */
  participant_member_ids?: string[]
}

export { type NewOrderDTO }
