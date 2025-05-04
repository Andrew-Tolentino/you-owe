import { type NewGroupDTO } from '@/api/dtos/NewGroupDTO'
import { HTTP_CODES } from '@/api/utils/HTTPStatusCodes'
import Logger from '@/utils/logger'
import { createNewGroupAction } from '@/actions/create-new-group-action'

const LOGGER_PREFIX = '[app/api/groups/route]'

/**
 * HTTP POST method to create a new Group.
 * 
 * @param {Request} request - Required to contain the 'NewGroupDTO' within the request body
 */
export async function POST(request: Request) {
  let requestBody: NewGroupDTO | null = null
  try {
    requestBody = await request.json()
  } catch(err) {
    Logger.info(`${LOGGER_PREFIX} POST: Error when loading in request body. Error found: ${JSON.stringify(err)}`)
    return new Response(null, { status: HTTP_CODES.BAD_REQUEST })
  }

  const results = await createNewGroupAction(requestBody as NewGroupDTO)
  if (!results.success) {
    return Response.json({ error: results.errorMessage }, { status: results.httpCode })
  }

  return Response.json(results.payload, { status:results.httpCode })
}
