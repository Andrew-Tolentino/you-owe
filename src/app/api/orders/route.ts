import { NextRequest } from 'next/server'

import { createNewOrderAction } from '@/actions/create-new-order-action'
import { getOrdersAction } from '@/actions/get-orders-action'
import { type NewOrderDTO } from '@/api/dtos/NewOrderDTO'
import { HTTP_CODES } from '@/api/utils/HTTPStatusCodes'
import Logger from '@/utils/logger'

const LOGGER_PREFIX = '[app/api/orders/route]'

/** Query parameters that can be used as filters when retreiving Orders via GET method on /api/orders. */
interface OrdersGetParams {
  group_id: string | null
  creator_member_id: string | null
}

/**
 * HTTP POST method to create an Order for a Group
 * 
 * @param request - Required to contain the 'NewOrderDTO' within the request body.
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

/**
 * HTTP GET method to retreive Orders based on different filters.
 * 
 * @param {NextRequest} request
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const queryParams: OrdersGetParams = {
    group_id: searchParams.get('group_id') ?? null,
    creator_member_id: searchParams.get('creator_member_id') ?? null
  }

  if (!queryParams.group_id && !queryParams.creator_member_id) {
    return Response.json({ error: 'Please have at least one query parameter for filtering through Orders.' }, { status: HTTP_CODES.BAD_REQUEST })
  }

  const result = await getOrdersAction(queryParams.group_id, queryParams.creator_member_id)
    if (!result.success) {
    return Response.json({ error: result.errorMessage }, { status: result.httpCode })
  }

  return Response.json(result.payload, { status: result.httpCode })
}
