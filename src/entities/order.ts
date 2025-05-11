import { type YouOweEntity } from '@/entities/entity';

/** Table name corresponding to the Orders entity */
export const TABLE_NAME = 'orders'

/**
 * Mapping of the "orders" table in the Database.
 */
interface Order extends YouOweEntity {
  /**
   * ID of the Group the Order belongs to.
   */
  group_id: string

  /**
   * ID of the Member who created the Order.
   */
  creator_member_id: string

  /**
   * Name of the Order.
   */
  title: string

  /**
   * Note for the Order.
   */
  description: string | null

  /**
   * Cost of the Order.
   */
  price: number

  /**
   * Number of Members who are involved with this Order.
   */
  number_of_participants: number

  /**
   * Date the Order was created.
   */
  created_at: Date

  /**
   * Date the Order was deleted.
   */
  deleted_at: Date | null
}

export { type Order }
