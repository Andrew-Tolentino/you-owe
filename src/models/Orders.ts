import { type NewOrderDTO } from '@/api/dtos/NewOrderDTO'
import { type DBClient } from '@/db/db-client'
import { type DatabaseError } from '@/db/db-custom-error'
import { PROC_CREATE_NEW_ORDER, PROC_GET_ORDERS, type ProcGetOrdersParameters, type ProcCreateNewOrderParameters } from '@/db/stored-procedures'
import { SupabaseDBClient } from '@/db/supabase-client'
import { type Order, TABLE_NAME as OrdersTable } from '@/entities/order'
import { OrdersWithMembers } from '@/types/orders-with-members-type'

/** Model representing the Orders entity that can be use for business logic related to Orders. */
export class Orders {
  private _dbClient: DBClient

  constructor() {
    this._dbClient = new SupabaseDBClient()
  }

  /**
   * Creates a new Order for a Member linked to a Group.
   * 
   * @param {string} newOrderDTO - DTO mapping of the new Order
   * 
   * @returns {Promise<{ data?: Order, error?: DatabaseError }>} Returns the Order if successful, else a DatabaseError.
   */
  async createOrder(newOrderDTO: NewOrderDTO): Promise<{ data?: Order, error?: DatabaseError }> {
    const procParams: ProcCreateNewOrderParameters = {
      creator_member_id: newOrderDTO.creator_member_id.trim(),
      target_group_id: newOrderDTO.group_id.trim(),
      target_title: newOrderDTO.title.trim(),
      target_price: newOrderDTO.price,
      target_description: newOrderDTO.description?.trim() ?? null,
      target_participant_member_ids: newOrderDTO.participant_member_ids?.map((memberId) => memberId.trim()) ?? []
    }

    const storedProcResults = await this._dbClient.invokeStoredProcedure<Order>(PROC_CREATE_NEW_ORDER, procParams)
    if (!storedProcResults.success) {
      return { error: storedProcResults.databaseError as DatabaseError}
    }

    return { data: storedProcResults.payload as Order }
  }

  /**
   * Fetches Orders based on filter queries.
   * 
   * @param {string} targetGroupId - Optional query filter to get Orders belonging to a Group based on Group ID.
   * @param {string} targetCreatorMemberId - Optional query filter to get Orders created by a Member based on Member ID.
   * 
   * @returns {Promise<{data?: OrdersWithMembers[], error?: DatabaseError}>} Returns a list of Orders and Members information if successful, else a DatabaseError.
   */
  async fetchOrders(targetGroupId: string | null, targetCreatorMemberId: string | null): Promise<{data?: OrdersWithMembers[], error?: DatabaseError}> {
    const procParam: ProcGetOrdersParameters = {
      target_group_id: targetGroupId,
      target_creator_member_id: targetCreatorMemberId
    }

    const storedProcResults = await this._dbClient.invokeStoredProcedure<OrdersWithMembers[]>(PROC_GET_ORDERS, procParam)
    if (!storedProcResults.success) {
      return { error: storedProcResults.databaseError as DatabaseError}
    }

    return { data: storedProcResults.payload }
  }

  /**
   * Fetches a Order given its ID.
   * 
   * @param {string} orderId - ID belonging to Order
   * 
   * @returns {Promise<Order | null>} Returns Order if found, else null
   */
  async fetchOrder(orderId: string): Promise<Order | null> {
    const order: Order[] | null = await this._dbClient.getEntityById(OrdersTable, orderId) as Order[]
    if (order === null) {
      return null
    }

    if (order.length === 0) {
      return null
    }

    return order[0] as Order
  }

  /**
   * Updates an Order by ID.
   * 
   * @param {string} orderId - ID of the Order to update
   * @param {Partial<Order>} updatedOrder - Updated Order entity
   * 
   * @returns {Promise<Order | null>} The updated Order if update was successful, else null
   */
  async updateOrderById(orderId: string, updatedOrder: Partial<Order>): Promise<Order | null> {
    const order = await this._dbClient.updateEntityById(OrdersTable, orderId, updatedOrder)
    if (order === null) {
      return null
    }

    return order as Order
  }
}
