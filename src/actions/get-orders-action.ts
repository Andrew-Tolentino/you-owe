import { getHttpCodeFromCustomDatabaseError, HTTP_CODES } from '@/api/utils/HTTPStatusCodes'
import { Orders } from '@/models/Orders'
import { type OrdersWithMembers } from '@/types/orders-with-members-type'
import { type ServerActionResults } from '@/types/promise-results-types'

/**
 * Gets all active Orders belonging to a Group.
 * 
 * @param {string} targetGroupId - Filter to get Orders belonging to a Group based on Group ID.
 * @param {string} targetCreatorMamberId - Filter to get Orders created by a Member based on Member ID
 * 
 * @returns {Promise<ServerActionResults<OrdersWithMembers[]>>} 
 */
export async function fetchOrdersAction(targetGroupId: string | null = null, targetCreatorMamberId: string | null = null): Promise<ServerActionResults<OrdersWithMembers[]>> {
  const orders = new Orders()
  const { data, error } = await orders.fetchOrders(targetGroupId, targetCreatorMamberId)
  if (error) {
    return { success: false, errorMessage: error.clientMessage, httpCode: getHttpCodeFromCustomDatabaseError(error.errorType) }
  }

  return { success: true, payload: data as OrdersWithMembers[], httpCode: HTTP_CODES.OK }
}
