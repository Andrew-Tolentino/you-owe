import { type NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { ERROR_MESSAGE_FUNCTIONS, HTTP_CODES, HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import { SUPABASE_CLIENT } from '@/api/clients/clients'
import Logger from '@/api/utils/logger'
import { DBClient } from '@/db/db-client'
import { SupabaseDBClient } from '@/db/supabase-client'
import { type Members } from '@/entities/members'
import { type Groups, TABLE_NAME as GroupsTable } from '@/entities/groups'
import { PROC_CREATE_NEW_MEMBER_AND_LINK_TO_MEMBERS_GROUPS, ProcCreateNewMemberAndLinkToMemberGroups } from '@/db/stored-procedures'
import { isString } from '@/api/utils/validators'

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
  
  // Validate DTO
  const validationError = validateNewMemberDTO(requestBody as NewMemberDTO)
  if (validationError !== null) {
    return Response.json({ error: validationError }, { status: HTTP_CODES.BAD_REQUEST })
  }
  if (!requestBody?.group_id || !isString(requestBody.group_id)) {
    return Response.json({ error: "'group_id' field is invalid." }, { status: HTTP_CODES.BAD_REQUEST })
  }

  const newMemberDTO: NewMemberDTO = { name: requestBody!.name.trim(), group_id: requestBody!.group_id.trim() }

  // Verify that the 'group_id' belongs to an active Group
  const db: DBClient = new SupabaseDBClient()
  const group: Groups | null = await db.getEntityById(GroupsTable, newMemberDTO.group_id as string) as Groups
  if (group === null || group.deleted_at !== null) {
    return Response.json({ error: ERROR_MESSAGE_FUNCTIONS.RESOURCE_WITH_ID_NOT_FOUND('Group', newMemberDTO.group_id as string) }, { status: HTTP_CODES.BAD_REQUEST })
  }

  /**
   * Edge cases to think about in the future
   *  1. What if an error occurs during the Members DB insertion after creating an anonymous user?
   *    a. Do we need a plan to delete the created user?
   */

  // Create anonymous user
  const { data, error } = await SUPABASE_CLIENT.auth.signInAnonymously()
  if (error !== null) {
    Logger.error(`${LOGGER_PREFIX} POST: Error when creating an anonymous user. Error code: ${error.code} and message: ${error.message}`)
    return Response.json(HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, { status: HTTP_CODES.INTERNAL_SERVER_ERROR })
  }

  if (data.user) {
    // Create new Member and link them to the Group they wish to join
    const procParams: ProcCreateNewMemberAndLinkToMemberGroups = {
      member_name: newMemberDTO.name,
      group_id: newMemberDTO.group_id as string,
      auth_user_id: data.user.id
    } 
    const members = await db.invokeStoredProcedure(PROC_CREATE_NEW_MEMBER_AND_LINK_TO_MEMBERS_GROUPS, procParams) as Members[]
    if (members === null) {
      return Response.json(HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, { status: HTTP_CODES.INTERNAL_SERVER_ERROR })
    }

    return Response.json(members[0], { status: HTTP_CODES.CREATED })
  }
  
  return Response.json(HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, { status: HTTP_CODES.INTERNAL_SERVER_ERROR })
}

/**
 * Validates an incoming NewMemberDTO checking if the request has fulfilled all
 * checkmarks needed to create a Member.
 * 
 * @param {NewMemberDTO} DTO
 * 
 * @returns {string | null} Returns an error message string if there was an issue found in DTO. Else, returns null.
 */
function validateNewMemberDTO(DTO: NewMemberDTO): string | null {
  const { name, group_id } = DTO
  if (!isString(name)) {
    return "'name' field is invalid."
  }

  if (!isString(group_id)) {
    return "'group_id' field is invalid."
  }

  return null
}
