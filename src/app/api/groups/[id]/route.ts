import { ERROR_MESSAGE_FUNCTIONS, HTTP_CODES } from '@/api/utils/HTTPStatusCodes'
import { type DBClient } from '@/db/db-client'
import { SupabaseDBClient } from '@/db/supabase-client'
import { type Group, TABLE_NAME } from '@/entities/groups'

/**
 * HTTP GET method to retrieve a Group given a Group ID.
 * 
 * @param {Request} _request 
 * @param {Object} params - Destructuring of an Object that contains the ID dynamic routing in a "params" key
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Fetch Groups entity with given ID
  const db: DBClient = new SupabaseDBClient()
  const group: Group | null = await db.getEntityById(TABLE_NAME, id) as Group
  if (group === null || group.deleted_at !== null) {
    return Response.json({ error: ERROR_MESSAGE_FUNCTIONS.RESOURCE_WITH_ID_NOT_FOUND('Groups', id) }, { status: HTTP_CODES.NOT_FOUND })
  }

  // TODO: Redacting passsord this way for now... Think of better way in future (maybe do at DB level).
  return Response.json({ ...group, password: null }, { status: HTTP_CODES.OK })
}
