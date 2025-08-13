"use server"

import { revalidatePath } from 'next/cache'

import { HTTP_CODES } from '@/api/utils/HTTPStatusCodes'
import { Group } from '@/entities/group'
import { Groups } from '@/models/Groups'
import { ServerActionResults } from '@/types/promise-results-types'
import { Member } from '@/entities/member'

/**
 * Server Action that fetches a Group given its ID.
 * 
 * @param {string} groupId - ID of Group to fetch
 * @param {boolean} includeMembers - Whether to include Members in Group in payload (false by default)
 * @param {boolean} redactPasssword - Whether to redact password in Group payload (true by default)
 * 
 * @returns {Promise<ServerActionResults<{ group: Group, members: Member[] }>>} ServerActionResults containing the Group and Members in payload if successful
*/
export async function getGroupServerAction(groupId: string, includeMembers: boolean = false, redactPasssword: boolean = true): Promise<ServerActionResults<{ group: Group, members: Member[] }>> {
  const groups = new Groups()
  const group = await groups.fetchGroup(groupId, redactPasssword)
  let members: Member[] = []
  if (group === null) {
    return { success: false, errorMessage: 'Group could not be found', httpCode: HTTP_CODES.NOT_FOUND }
  }

  if (includeMembers) {
    members = await groups.fetchGroupMembers(groupId) ?? []
  }

  revalidatePath('/', 'layout')
  return { success: true, payload: { group, members }, httpCode: HTTP_CODES.OK }
}
