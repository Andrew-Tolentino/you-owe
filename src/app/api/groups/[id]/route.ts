import { ERROR_MESSAGE_FUNCTIONS, HTTP_CODES } from '@/api/utils/HTTPStatusCodes'
import { Groups } from '@/models/Groups'

/**
 * HTTP GET method to retrieve a Group given a Group ID.
 * 
 * @param {Request} _request 
 * @param {Object} params - Destructuring of an Object that contains the ID dynamic routing in a "params" key
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Fetch Groups entity with given ID
  const groups = new Groups()
  const group = await groups.fetchGroup(id)

  if (group === null || group.deleted_at !== null) {
    return Response.json({ error: ERROR_MESSAGE_FUNCTIONS.RESOURCE_WITH_ID_NOT_FOUND('Groups', id) }, { status: HTTP_CODES.NOT_FOUND })
  }

  return Response.json(group, { status: HTTP_CODES.OK })
}
