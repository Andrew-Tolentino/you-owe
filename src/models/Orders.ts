import { type NewOrderDTO } from '@/api/dtos/NewOrderDTO'
import { type DBClient } from '@/db/db-client'
import { type DatabaseError } from '@/db/db-custom-error'
import { PROC_CREATE_NEW_ORDER, type ProcCreateNewOrderParameters } from '@/db/stored-procedures'
import { SupabaseDBClient } from '@/db/supabase-client'
import { type Order } from '@/entities/order'

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
   * @returns {Promise<{ data?: Order, error?: DatabaseError }>} Returns the Order if successful, else a DatabaseError
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
}
