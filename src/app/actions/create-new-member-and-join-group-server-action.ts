"use server"

import { revalidatePath } from 'next/cache'

import { NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { createNewMemberAndJoinGroupAction } from '@/actions/create-new-member-and-join-group-action'

// TODO write comment
export async function createNewMemberAndJoinGroupServerAction(newMemberDTO: NewMemberDTO) {
  const results = await createNewMemberAndJoinGroupAction(newMemberDTO)
  if (results.success) {
    revalidatePath('/', 'layout')
  }

  return results
}
