"use server"

import { revalidatePath } from 'next/cache'

import { updateGroupAction } from '@/actions/update-group-action'
import { Group, type UpdateGroupDTO } from '@/entities/group'
import { ServerActionResults } from '@/types/promise-results-types'

/**
 * Server Action that updates a Group given its ID.
 * 
 * @param {string} groupId - ID of Group to update
 * @param {updateGroupDTO} updateGroupDTO - Attributes to update in the Group
 *
 * @returns {Promise<ServerActionResults<Group>>} ServerActionResults with the payload containing the updated Group if successful
 */
export async function updateGroupServerAction(groupId: string, updateGroupDTO: UpdateGroupDTO): Promise<ServerActionResults<Group>> {
  const results = await updateGroupAction(groupId, updateGroupDTO)
  if (results.success) {
    // Revalidate cache since a Group has been updated
    revalidatePath('/', 'layout')
  }

  return results
}
