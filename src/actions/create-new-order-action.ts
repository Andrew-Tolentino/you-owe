import { type Order } from '@/entities/order'
import { type ServerActionResults } from '@/types/promise-results-types'
import { type NewOrderDTO } from '@/api/dtos/NewOrderDTO'
import { isString } from '@/api/utils/validators'
import { getHttpCodeFromCustomDatabaseError, HTTP_CODES } from '@/api/utils/HTTPStatusCodes'
import { Orders } from '@/models/Orders'

/**
 * Creates new Order for a Member within a Group.
 * 
 * @param {NewOrderDTO} newOrderDTO - DTO to create the Order
 * 
 * @returns {Promise<ServerActionResults<Order>>} ServerActionResults containing the 'Order' in payload if successful
 */
export async function createNewOrderAction(newOrderDTO: NewOrderDTO): Promise<ServerActionResults<Order>> {  
  // Validate DTO
  const DTOValidationError = validateNewOrderDTO(newOrderDTO)
  if (DTOValidationError !== null) {
    return { success: false, errorMessage: DTOValidationError, httpCode: HTTP_CODES.BAD_REQUEST }
  }

  const orders = new Orders()
  const { data, error } = await orders.createOrder(newOrderDTO)
  if (error) {
    return { success: false, errorMessage: error.clientMessage, httpCode: getHttpCodeFromCustomDatabaseError(error.errorType) }
  }

  return { success: true, payload: data as Order, httpCode: HTTP_CODES.CREATED }
}

/**
 * 
 * @param {NewOrderDTO} newOrderDTO - DTO to validate
 * 
 * @returns {string | null} Returns a string error message if a field is invalid. Else, returns null.
 */
function validateNewOrderDTO(newOrderDTO: NewOrderDTO): string | null {
  const { creator_member_id, group_id, title, description, price } = newOrderDTO
  if (!isString(creator_member_id)) {
    return "'creator_member_id' field is invalid."
  }

  if (!isString(group_id)) {
    return "'group_id' field is invalid."
  }

  if (!isString(title)) {
    return "'title' field is invalid."
  }

  if (description && !isString(description)) {
    return "'description' field is invalid."
  }

  if (isNaN(price) || price <= 0) {
    return "'price' field is invalid."
  }

  // If there are any participant Members, verify their IDs
  if (newOrderDTO.participant_member_ids && newOrderDTO.participant_member_ids.length > 0) {
    for (const id of newOrderDTO.participant_member_ids) {
      if (!isString(id)) {
        return "'participant_member_ids' field contains an invalid value."
      }
    }
  }

  return null
}
