import { NewMemberDTO, validateNewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { HTTP_CODES, HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import { SUPABASE_CLIENT } from '@/api/clients/clients'
import Logger from '@/api/utils/logger'
import { DBClient } from '@/db/db-client'
import { SupabaseDBClient } from '@/db/supabase-client'
import { Members, TABLE_NAME } from '@/entities/members'

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
    Logger.info(`${LOGGER_PREFIX} POST: Error when loading in request body. Error found: ${JSON.stringify(err)}`)
    return new Response(null, { status: HTTP_CODES.BAD_REQUEST })
  }
  
  // Validate DTO
  const validationError = validateNewMemberDTO(requestBody as NewMemberDTO)
  if (validationError !== null) {
    return Response.json({ error: validationError }, { status: HTTP_CODES.BAD_REQUEST })
  }

  const newMemberDTO: NewMemberDTO = { name: requestBody!.name.trim() }

  /**
   * Edge cases to think about in the future
   *  1. What if an error occurs during the Members DB insertion after creating an anonymous user?
   *    a. Do we need a plan to delete the created user?
   */

  // Create anonymous user
  const { data, error } = await SUPABASE_CLIENT.auth.signInAnonymously()
  if (error !== null) {
    Logger.info(`${LOGGER_PREFIX} POST: Error when creating an anonymous user. Error code: ${error.code} and message: ${error.message}`)
    return Response.json(HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, { status: HTTP_CODES.INTERNAL_SERVER_ERROR })
  }

  if (data.user) {
    // Create new member row in DB
    const db: DBClient = new SupabaseDBClient()
    const partialMember: Partial<Members> = { name: newMemberDTO.name, auth_user_id: data.user.id }
    const newMember = await db.createEntity(TABLE_NAME, partialMember)
    if (newMember) {
      return Response.json(newMember, { status: HTTP_CODES.CREATED })
    }
  }
  
  return Response.json(HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, { status: HTTP_CODES.INTERNAL_SERVER_ERROR })
}
