import { HTTP_CODES } from '@/api/utils/HTTPStatusCodes'
import Logger from '@/utils/logger'
import { type JoinGroupDTO } from '@/api/dtos/JoinGroupDTO'
import { memberJoinGroupAction } from '@/actions/member-join-group-action'

const LOGGER_PREFIX = '[app/api/members-groups/route]'

/**
 * HTTP POST method to link a Member with a Group.
 * 
 * @param {Request} request - Required to contain the 'JoinGroupDTO' within the request body.
 */
export async function POST(request: Request) {
  let requestBody: JoinGroupDTO | null = null
  try {
    requestBody = await request.json() as JoinGroupDTO
  } catch(err) {
    Logger.info(`${LOGGER_PREFIX} POST: Error when loading in request body. Error found: ${JSON.stringify(err)}`)
    return new Response(null, { status: HTTP_CODES.BAD_REQUEST })
  }

  const result = await memberJoinGroupAction(requestBody)
  if (!result.success) {
    return Response.json({ error: result.errorMessage }, { status: result.httpCode })
  }

  return new Response(null, { status: HTTP_CODES.CREATED })
 }
