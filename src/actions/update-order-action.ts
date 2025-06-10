import { type UpdateOrderDTO } from '@/api/dtos/UpdateOrderDTO'
import { ERROR_MESSAGE_FUNCTIONS, HTTP_CODES, HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes';
import { isString } from '@/api/utils/validators';
import { type Order } from '@/entities/order';
import { Members } from '@/models/Members';
import { Orders } from '@/models/Orders';
import { Users } from '@/models/Users';
import { type ServerActionResults } from '@/types/promise-results-types'
import Logger from '@/utils/logger';

const LOGGER_PREFIX = '[actions/update-order-action]'

/**
 * Updates an Order by first verifying the following:
 *  1. Order exists and has not been deleted
 *  2. Requester is an aunthenticated User
 *  3. User is linked to a Member who created the Order
 * 
 * @param {UpdateOrderDTO} updateOrderDTO - DTO to update an Order
 * @param {string} orderId - ID associated to the Order
 * 
 * @returns {Promise<ServerActionResults<Order>>} ServerActionResults containing the updated 'Order' in payload if successful
 */
export async function updateOrderAction(updateOrderDTO: UpdateOrderDTO, orderId: string): Promise<ServerActionResults<Order>> {
  // Fetch current Order given ID
  const orders = new Orders()
  const order = await orders.fetchOrder(orderId)

  // Order does not exist
  if (order === null) {
    return { success: false, errorMessage: ERROR_MESSAGE_FUNCTIONS.RESOURCE_WITH_ID_NOT_FOUND('Order', orderId), httpCode: HTTP_CODES.BAD_REQUEST }
  }

  // Order has been marked as deleted
  if (order.deleted_at !== null) {
    return { success: false, errorMessage: `Order with ID "${orderId}" has been deleted.`, httpCode: HTTP_CODES.BAD_REQUEST }
  }

  // Verify that the requester is the Order creator
  const users = new Users()
  const userId = await users.getUserId()

  // There is no user found in request
  if (userId === null) {
    return { success: false, errorMessage: HTTP_ERROR_MESSAGES.UNVERIFIABLE_REQUESTER, httpCode: HTTP_CODES.BAD_REQUEST }
  }

  // Fetch Member associated to User ID found in request
  const members = new Members()
  const member = await members.fetchMemberByAuthUserId(userId)

  // No Member is found being associated to the User ID. This is an issue interally.
  if (member === null) {
    Logger.error(`${LOGGER_PREFIX} updateOrderAction: Unable to find a Member resource linked to User with ID "${userId}".`)
    return { success: false, errorMessage: HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, httpCode: HTTP_CODES.INTERNAL_SERVER_ERROR }
  }

  // Member has been marked as deleted
  if (member.deleted_at !== null) {
    return { success: false, errorMessage: `Member who created Order with ID "${orderId}" does not exist anymore.`, httpCode: HTTP_CODES.BAD_REQUEST }
  }

  // Member is not the creator of the Order
  if (member.id !== order.creator_member_id) {
    return { success: false, errorMessage: 'Users can only updated Orders they created.', httpCode: HTTP_CODES.BAD_REQUEST }
  }

  // Update the Order
  const orderUpdates: Partial<Order> = {}
    if (updateOrderDTO.title && isString(updateOrderDTO.title)) {
      orderUpdates.title = updateOrderDTO.title.trim()
    }
    if (updateOrderDTO.description && isString(updateOrderDTO.description)) {
      orderUpdates.description = updateOrderDTO.description.trim()
    }
    if (updateOrderDTO.price && !isNaN(updateOrderDTO.price)) {
      orderUpdates.price = updateOrderDTO.price
    }

  const updatedOrder = await orders.updateOrderById(orderId, orderUpdates)
  if (updatedOrder === null) {
    Logger.error(`${LOGGER_PREFIX} updateOrderAction: Unable to updated Order with ID "${orderId}" linked to User with ID "${userId}".`)
    return { success: false, errorMessage: HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, httpCode: HTTP_CODES.INTERNAL_SERVER_ERROR }
  }

  return { success: true, payload: updatedOrder, httpCode: HTTP_CODES.OK }
}
