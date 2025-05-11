"use server"

import { revalidatePath } from 'next/cache'

import { createNewGroupAction } from '@/actions/create-new-group-action'
import { type NewGroupDTO } from '@/api/dtos/NewGroupDTO'
import { type ServerActionResults } from '@/types/promise-results-types'
import { type Group } from '@/entities/group'

export async function createNewGroupServerAction(newGroupDTO: NewGroupDTO): Promise<ServerActionResults<Group>> {
  const result = await createNewGroupAction(newGroupDTO)
  if (result.success) {
    revalidatePath('/', 'layout')
  }

  return result
}
