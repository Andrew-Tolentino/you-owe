"use server"

import { revalidatePath } from 'next/cache'

import { createNewGroupAction } from '@/actions/create-new-group-action'
import { NewGroupDTO } from '@/api/dtos/NewGroupDTO'
import { ServerActionResults } from '@/types/promise-results-types'
import { Group } from '@/entities/group'

/**
 * Server Action that creates a Group.
 * 
 * @param {NewGroupDTO} newGroupDTO
 * 
 * @returns {Promise<ServerActionResults<Group>>} ServerActionResults containing the new Group in payload if successful
 */
export async function createNewGroupServerAction(newGroupDTO: NewGroupDTO): Promise<ServerActionResults<Group>> {
  const result = await createNewGroupAction(newGroupDTO)
  if (result.success) {
    revalidatePath('/', 'layout')
  }

  return result
}
