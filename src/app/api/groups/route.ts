import { NewGroupDTO, validateNewGroupDTO } from '@/api/dtos/NewGroupDTO'
import { HTTP_CODES, ERROR_MESSAGE_FUNCTIONS, HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import Logger from '@/api/utils/logger'
import { DBClient } from '@/db/db-client'
import { SupabaseDBClient } from '@/db/supabase-client'
import { Members, TABLE_NAME as MembersTable } from '@/entities/members'
import { Groups, TABLE_NAME as GroupsTable } from '@/entities/groups'

const LOGGER_PREFIX = '[app/api/groups/route]'

/**
 * HTTP POST method to create a new Group.
 * 
 * @param {Request} request 
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

  const newGroupDTO: NewGroupDTO = { 
    name: requestBody!.name?.trim(),
    password: requestBody!.password?.trim(),
    creator_member_id: requestBody!.creator_member_id?.trim()
  }
  
  // Check if the 'creator_member_id' belongs to an active user
  const db: DBClient = new SupabaseDBClient()
  const creatorMember: Members | null = await db.getEntityById(MembersTable, newGroupDTO.creator_member_id) as Members
  if (creatorMember === null || creatorMember.deleted_at !== null) {
    return Response.json({ error: ERROR_MESSAGE_FUNCTIONS.RESOURCE_WITH_ID_NOT_FOUND('Member', newGroupDTO.creator_member_id) }, { status: HTTP_CODES.BAD_REQUEST })
  }

  const partialGroup: Partial<Groups> = { name: newGroupDTO.name, password: newGroupDTO.password ?? null, creator_member_id: newGroupDTO.creator_member_id }
  const newGroup = await db.createEntity(GroupsTable, partialGroup)
  if (newGroup === null) {
      return Response.json(HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, { status: HTTP_CODES.INTERNAL_SERVER_ERROR })
  }

  return Response.json(newGroup, { status: HTTP_CODES.CREATED })
}
