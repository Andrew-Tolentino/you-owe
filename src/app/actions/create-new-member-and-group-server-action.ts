"use server"

import { revalidatePath } from 'next/cache'

import { NewGroupDTO } from '@/api/dtos/NewGroupDTO'
import { NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { createNewMemberAndGroupAction, type CreateNewMemberAndGroupActionPayload } from '@/actions/create-new-member-and-group-action'
import { ServerActionResults } from '@/types/promise-results-types'

// TODO write comment
export async function createNewMemberAndGroupServerAction(newMemberDTO: NewMemberDTO, newGroupDTO: NewGroupDTO): Promise<ServerActionResults<CreateNewMemberAndGroupActionPayload>> {
  const results = await createNewMemberAndGroupAction(newMemberDTO, newGroupDTO)
  if (results.success) {
    // Revalidate cache since a User has now been created and logged in
    revalidatePath('/', 'layout')
  }

  return results
}
