import { updateOrderAction } from '@/actions/update-order-action'
import { type UpdateOrderDTO } from '@/api/dtos/UpdateOrderDTO'
import { HTTP_CODES } from '@/api/utils/HTTPStatusCodes'
import Logger from '@/utils/logger'

const LOGGER_PREFIX = '[app/api/orders/[id]/route]'

/**
 * HTTP PUT method to update an Order.
 * 
 * @param {Request} request
 * @param {Object} params - Destructuring of an Object that contains the ID dynamic routing in a "params" key
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let requestBody: UpdateOrderDTO | null = null
  try {
    requestBody = await request.json() as UpdateOrderDTO
  } catch(err) {
    Logger.info(`${LOGGER_PREFIX} PUT: Error when loading in request body. Error found: ${JSON.stringify(err)}`)
    return new Response(null, { status: HTTP_CODES.BAD_REQUEST })
  }
  const { id } = await params

  const { success, errorMessage, httpCode, payload } = await updateOrderAction(requestBody as UpdateOrderDTO, id)
  if (!success) {
    return Response.json({ error: errorMessage }, { status: httpCode })
  }

  return Response.json(payload, { status: httpCode })
}
