import { NextRequest } from 'next/server'

import { ERROR_MESSAGE_FUNCTIONS, HTTP_CODES } from '@/api/utils/HTTPStatusCodes'
import { Groups } from '@/models/Groups'
import { type QueryParameters } from '@/types/query-parameters-type'
import { isStringBooleanTrue } from '@/api/utils/validators'
import { TABLE_NAME as MembersTable } from '@/entities/member'
import { type UpdateGroupDTO } from '@/entities/group'
import Logger from '@/utils/logger'
import { updateGroupAction } from '@/actions/update-group-action'

const LOGGER_PREFIX = '[app/api/groups/[id]/route]'

interface GETQueryParams {
  include_members?: string
}

/**
 * HTTP GET method to retrieve a Group given a Group ID.
 * 
 * @param {NextRequest} request 
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

/**
 * HTTP PUT method to update a Group.
 * 
 * @param {NextRequest} request 
 * @param {Object} params - Destructuring of an Object that contains the ID dynamic routing in a "params" key
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let requestBody: UpdateGroupDTO | null = null
  try {
    requestBody = await request.json() as UpdateGroupDTO
  } catch(err) {
    Logger.info(`${LOGGER_PREFIX} PUT: Error when loading in request body. Error found: ${JSON.stringify(err)}`)
  }
  const { id } = await params

  const { success, errorMessage, httpCode, payload } = await updateGroupAction(requestBody as UpdateGroupDTO, id)
  if (!success) {
    return Response.json({ error: errorMessage }, { status: httpCode })
  }

  console.log('payload', payload, success)

  return Response.json(payload, { status: httpCode })
}
