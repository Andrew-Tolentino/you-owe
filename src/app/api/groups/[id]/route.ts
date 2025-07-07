import { NextRequest } from 'next/server'

import { ERROR_MESSAGE_FUNCTIONS, HTTP_CODES } from '@/api/utils/HTTPStatusCodes'
import { Groups } from '@/models/Groups'
import { type QueryParameters } from '@/types/query-parameters-type'
import { isStringBooleanTrue } from '@/api/utils/validators'
import { TABLE_NAME as MembersTable } from '@/entities/member'

interface GETQueryParams {
  include_members?: string
}

/**
 * HTTP GET method to retrieve a Group given a Group ID.
 * 
 * @param {Request} request 
 * @param {Object} params - Destructuring of an Object that contains the ID dynamic routing in a "params" key
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const urlSearchParams = request.nextUrl.searchParams
  const queryParams: QueryParameters = { }
  for (const [key, value] of urlSearchParams.entries()) {
    queryParams[key] = value
  }
  const getQueryParams = queryParams as GETQueryParams

  // Fetch Group given ID
  const groups = new Groups()
  const group = await groups.fetchGroup(id)

  if (group === null) {
    return Response.json({ error: ERROR_MESSAGE_FUNCTIONS.RESOURCE_WITH_ID_NOT_FOUND('Groups', id) }, { status: HTTP_CODES.NOT_FOUND })
  }

  // Request wants to include Members in Group as part of response
  if (isStringBooleanTrue(getQueryParams.include_members)) {
    const members = await groups.fetchGroupMembers(group.id)
    if (members === null) {
      return new Response(null, { status: HTTP_CODES.INTERNAL_SERVER_ERROR })
    }

    return Response.json({ ...group, [MembersTable]: members }, { status: HTTP_CODES.OK })
  }

  return Response.json(group, { status: HTTP_CODES.OK })
}
