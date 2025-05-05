import { type NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import Logger from '@/utils/logger'
import { createNewMemberAndJoinGroupAction } from '@/actions/create-new-member-and-join-group-action'
import { HTTP_CODES } from '@/api/utils/HTTPStatusCodes'

const LOGGER_PREFIX = '[app/api/members/route]' 

/**
 * HTTP POST method to create a new User and Member.
 * The User and Member entities are connected through the User's auth_user_id via FK in the Members table.
 * 
 * @param {Request} request - Required to contain the 'NewMemberDTO' within the request body.
 */
export async function POST(request: Request) {
  let requestBody: NewMemberDTO | null = null
  try {
    requestBody = await request.json()
  } catch(err) {
    Logger.error(`${LOGGER_PREFIX} POST: Error when loading in request body. Error found: ${JSON.stringify(err)}`)
    return new Response(null, { status: HTTP_CODES.BAD_REQUEST })
  }
  
  const results = await createNewMemberAndJoinGroupAction(requestBody as NewMemberDTO)
  if (!results.success) {
    return Response.json({ error: results.errorMessage }, { status: results.httpCode })
  }

  return Response.json(results.payload, { status: HTTP_CODES.CREATED })
}
