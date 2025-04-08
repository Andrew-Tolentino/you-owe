import { NewMemberDTO, validateNewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { HTTP_CODES, HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import { SUPABASE_CLIENT } from '@/api/clients/clients'
import Logger from '@/api/utils/logger'
import { DBClient } from '@/db/db-client'
import { SupabaseDBClient } from '@/db/supabase-client'
import { Members, TABLE_NAME } from '@/entities/members'

const LOGGER_PREFIX = '[app/api/members/route]' 

export async function POST(request: Request) {
  const requestBody: NewMemberDTO = await request.json()
  const validationError = validateNewMemberDTO(requestBody)
  if (validationError !== null) {
    return Response.json({ validationError }, { status: HTTP_CODES.BAD_REQUEST })
  }

  // Create anonymous user
  const { data, error } = await SUPABASE_CLIENT.auth.signInAnonymously()
  if (error !== null) {
    Logger.info(`${LOGGER_PREFIX} POST: Error when creating an anonymous user. Error code: ${error.code} and message: ${error.message}`)
    return Response.json(HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, { status: HTTP_CODES.INTERNAL_SERVER_ERROR })
  }

  if (data.user) {
    // Create new member row in DB
    const db: DBClient = new SupabaseDBClient()
    const partialMember: Partial<Members> = { name: requestBody.name, auth_user_id: data.user.id }
    const newMember = await db.createEntity(TABLE_NAME, partialMember)
    if (newMember) {
      return Response.json(newMember, { status: HTTP_CODES.CREATED })
    }
  }
  
  return Response.json(HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, { status: HTTP_CODES.INTERNAL_SERVER_ERROR })
}
