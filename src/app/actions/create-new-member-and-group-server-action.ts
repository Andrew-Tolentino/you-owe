"use server"

import { revalidatePath } from 'next/cache'

import { type NewGroupDTO } from '@/api/dtos/NewGroupDTO'
import { type NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { ServerActionResults } from '@/app/actions/return-types'
import { createNewMemberAndGroupAction, type CreateNewMemberAndGroupActionPayload } from '@/actions/create-new-member-and-group-action'

export async function createNewMemberAndGroupServerAction(newMemberDTO: NewMemberDTO, newGroupDTO: NewGroupDTO): Promise<ServerActionResults<CreateNewMemberAndGroupActionPayload>> {
  const results = await createNewMemberAndGroupAction(newMemberDTO, newGroupDTO)
  if (results.success) {
    // Revalidate cache since a user has now been created and logged in
    revalidatePath('/', 'layout')
  }

  return results
}
