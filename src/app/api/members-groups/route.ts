import { SUPABASE_CLIENT } from '@/api/clients/clients'
import { type NewGroupDTO } from '@/api/dtos/NewGroupDTO'
import { type NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { HTTP_CODES, HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import Logger from '@/api/utils/logger'
import { DBClient } from '@/db/db-client'
import { SupabaseDBClient } from '@/db/supabase-client'
import { PROC_CREATE_NEW_MEMBER_AND_GROUP, type ProcCreateNewMemberAndGroup } from '@/db/stored-procedures'
import { isString, isValidGroupPassword } from '@/api/utils/validators'

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

  // Validate DTOs
  const DTOValidationError = validateNewMemberAndNewGroupDTO(requestBody)
  if (DTOValidationError !== null) {
    return Response.json({ error: DTOValidationError}, { status: HTTP_CODES.BAD_REQUEST })
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
    const newGroupID = await db.invokeStoredProcedure(PROC_CREATE_NEW_MEMBER_AND_GROUP, procParams) as string
    if (newGroupID !== null) {
      return Response.json({ group_id: newGroupID }, { status: HTTP_CODES.CREATED }) 
    }
  }

  return Response.json(HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, { status: HTTP_CODES.INTERNAL_SERVER_ERROR }) 
}

/**
 * Validates the incoming DTO for creating a new Member and Group.
 * 
 * @param {NewMemberAndNewGroupDTO} DTO 
 * @returns {string | null} Returns a string if a field is invalid. Else, null.
 */
function validateNewMemberAndNewGroupDTO(DTO: NewMemberAndNewGroupDTO): string | null {
  const { member: memberDTO, group: groupDTO } = DTO
  
  // Validate member DTO
  const { name: memberName } = memberDTO
  if (!isString(memberName)) {
    return "'name' field is invalid for Member."
  }

  // Validate group DTO
  const { name: groupName, password } = groupDTO
  if (!isString(groupName)) {
    return "'name' field is invalid for Group."
  }

  // Group can set a password to join
  const groupPasswordErrorValidationMessage = isValidGroupPassword(password)
  if (groupPasswordErrorValidationMessage !== null) {
    return groupPasswordErrorValidationMessage
  }

  return null
}
