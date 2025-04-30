import { type NewGroupDTO } from '@/api/dtos/NewGroupDTO'
import { type NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { HTTP_CODES } from '@/api/utils/HTTPStatusCodes'
import Logger from '@/utils/logger'
import { createNewMemberAndGroupAction } from '@/actions/create-new-member-and-group-action'

const LOGGER_PREFIX = '[app/api/members-groups/route]'

interface NewMemberAndNewGroupDTO {
  member: NewMemberDTO,
  group: NewGroupDTO
}

/**
 * HTTP POST method to create a new User, Member, and Group.
 * 
 * @param {Request} request - Required to contain the 'NewMemberAndNewGroupDTO' within the request body.
 * @returns 
 */
export async function POST(request: Request) {
  let requestBody: NewMemberAndNewGroupDTO | null = null
  try {
    requestBody = await request.json() as NewMemberAndNewGroupDTO
  } catch(err) {
    Logger.info(`${LOGGER_PREFIX} POST: Error when loading in request body. Error found: ${JSON.stringify(err)}`)
    return new Response(null, { status: HTTP_CODES.BAD_REQUEST })
  }

  const { member: memberDTO, group: groupDTO } = requestBody
  const result = await createNewMemberAndGroupAction(memberDTO, groupDTO)
  if (!result.success) {
    return Response.json({ error: result.errorMessage }, { status: result.httpCode })
  }

  return Response.json({ member: result.payload?.member, group: result.payload?.group }, { status: result.httpCode })
}
