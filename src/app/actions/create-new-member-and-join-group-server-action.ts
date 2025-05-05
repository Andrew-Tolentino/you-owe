"use server"

import { revalidatePath } from 'next/cache'

import { type NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { createNewMemberAndJoinGroupAction } from '@/actions/create-new-member-and-join-group-action'

export async function createNewMemberAndJoinGroupServerAction(newMemberDTO: NewMemberDTO) {
  const results = await createNewMemberAndJoinGroupAction(newMemberDTO)
  if (results.success) {
    revalidatePath('/', 'layout')
  }

  return results
}
