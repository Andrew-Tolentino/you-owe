import { SUPABASE_CLIENT } from '@/api/clients/clients'
import { type NewGroupDTO, validateNewGroupDTO } from '@/api/dtos/NewGroupDTO'
import { type NewMemberDTO, validateNewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { HTTP_CODES, HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import Logger from '@/api/utils/logger'
import { DBClient } from '@/db/db-client'
import { SupabaseDBClient } from '@/db/supabase-client'
import { PROC_CREATE_NEW_MEMBER_AND_GROUP, type ProcCreateNewMemberAndGroup } from '@/db/stored-procedures'

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

  const { member: memberDTO, group: groupDTO } = requestBody as NewMemberAndNewGroupDTO

  // Validate DTOs
  const memberDTOValidationError = validateNewMemberDTO(memberDTO)
  if (memberDTOValidationError !== null) {
    return Response.json({ error: memberDTOValidationError}, { status: HTTP_CODES.BAD_REQUEST })
  }

  const groupDTOValidationError = validateNewGroupDTO(groupDTO)
  if (groupDTOValidationError !== null) {
    return Response.json({ error: groupDTOValidationError }, { status: HTTP_CODES.BAD_REQUEST })
  }

  // Create Supabase anonymous user
  const { data, error } = await SUPABASE_CLIENT.auth.signInAnonymously()
  if (error !== null) {
    Logger.error(`${LOGGER_PREFIX} POST: Error when creating an anonymous user. Error code: ${error.code} and message: ${error.message}`)
    return Response.json(HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, { status: HTTP_CODES.INTERNAL_SERVER_ERROR })
  }

  // Now that an anonymous user has been created, create the new Member and Group entities
  if (data.user) {
    const db: DBClient = new SupabaseDBClient()
    const procParams: ProcCreateNewMemberAndGroup = {
      member_name: memberDTO.name.trim(),
      group_name: groupDTO.name.trim(),
      group_password: groupDTO.password ? groupDTO.password.trim() : null,
      auth_user_id: data.user.id
    }
    const newGroupID = await db.invokeStoredProcedure<string>(PROC_CREATE_NEW_MEMBER_AND_GROUP, procParams)
    if (newGroupID !== null) {
      return Response.json({ group_id: newGroupID }, { status: HTTP_CODES.CREATED }) 
    }
  }

  return Response.json(HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, { status: HTTP_CODES.INTERNAL_SERVER_ERROR }) 
}
