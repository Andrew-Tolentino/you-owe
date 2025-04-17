import { type NewGroupDTO, validateNewGroupDTO } from '@/api/dtos/NewGroupDTO'
import { HTTP_CODES, ERROR_MESSAGE_FUNCTIONS, HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import Logger from '@/api/utils/logger'
import { DBClient } from '@/db/db-client'
import { SupabaseDBClient } from '@/db/supabase-client'
import { type Members, TABLE_NAME as MembersTable } from '@/entities/members'
import { type Groups, TABLE_NAME as GroupsTable } from '@/entities/groups'
import { isString } from '@/api/utils/validators'

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

  // Validate DTO
  const validationError = validateNewGroupDTO(requestBody as NewGroupDTO)
  if (validationError !== null) {
    return Response.json({ error: validationError }, { status: HTTP_CODES.BAD_REQUEST })
  }

  // Verify that the 'creator_member_id' is in the DTO
  if (!isString(requestBody?.creator_member_id ?? '')) {
    return Response.json({ error: "'creator_member_id' field is invalid." }, { status: HTTP_CODES.BAD_REQUEST })
  }

  const newGroupDTO: NewGroupDTO = { 
    name: requestBody!.name?.trim(),
    password: isString(requestBody!.password) ? requestBody!.password?.trim() : null ,
    creator_member_id: requestBody!.creator_member_id?.trim()
  }
  
  // Check if the 'creator_member_id' belongs to an active user
  const db: DBClient = new SupabaseDBClient()
  const creatorMember: Members | null = await db.getEntityById(MembersTable, newGroupDTO.creator_member_id as string) as Members
  if (creatorMember === null || creatorMember.deleted_at !== null) {
    return Response.json({ error: ERROR_MESSAGE_FUNCTIONS.RESOURCE_WITH_ID_NOT_FOUND('Member', newGroupDTO.creator_member_id as string) }, { status: HTTP_CODES.BAD_REQUEST })
  }

  const partialGroup: Partial<Groups> = { name: newGroupDTO.name, password: newGroupDTO.password, creator_member_id: newGroupDTO.creator_member_id }
  const newGroup = await db.createEntity(GroupsTable, partialGroup)
  if (newGroup === null) {
      return Response.json(HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, { status: HTTP_CODES.INTERNAL_SERVER_ERROR })
  }

  // TODO: Redacting passsord this way for now... Think of better way in future (maybe do at DB level).
  return Response.json({ ...newGroup, password: null }, { status: HTTP_CODES.CREATED })
}
