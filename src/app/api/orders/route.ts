import { createNewOrderAction } from '@/actions/create-new-order-action'
import { NewOrderDTO } from '@/api/dtos/NewOrderDTO'
import { HTTP_CODES } from '@/api/utils/HTTPStatusCodes'
import Logger from '@/utils/logger'

const LOGGER_PREFIX = '[app/api/orders/route]'

/**
 * TODO: Write comments
 * 
 * @param request 
 * @returns 
 */
export async function POST(request: Request) {
  let requestBody: NewOrderDTO | null = null
  try {
    requestBody = await request.json()
  } catch(err) {
    Logger.info(`${LOGGER_PREFIX} POST: Error when loading in request body. Error found: ${JSON.stringify(err)}`)
    return new Response(null, { status: HTTP_CODES.BAD_REQUEST })
  }

  const result = await createNewOrderAction(requestBody as NewOrderDTO)
  if (!result.success) {
    return Response.json({ error: result.errorMessage }, { status: result.httpCode })
  }

  return Response.json(result.payload, { status: result.httpCode })
}

/** Query parameters that can be used as filters when retreiving Orders via GET method on /api/orders. */
interface OrdersGetParams {
  group_id?: string
}

/**
 * HTTP GET method to retreive Orders based on different filters.
 * 
 * @param {Request} _request
 * @param {OrdersGetParams} params - Different filters that can be applied when getting Orders 
 */
export async function GET(_request: Request, { params }: { params: Promise<OrdersGetParams> }) {
  // Check for group_id query param
  const { group_id } = await params

}
