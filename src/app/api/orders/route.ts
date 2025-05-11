import { createNewOrderAction } from '@/actions/create-new-order-action'
import { NewOrderDTO } from '@/api/dtos/NewOrderDTO'
import { HTTP_CODES, HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import Logger from '@/utils/logger'

const LOGGER_PREFIX = '[app/api/orders/route]'

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

