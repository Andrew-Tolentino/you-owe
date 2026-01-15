"use server"

import { revalidatePath } from 'next/cache'

import { NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { createNewMemberAndJoinGroupAction } from '@/actions/create-new-member-and-join-group-action'
import { ServerActionResults } from '@/types/promise-results-types'
import { Member } from '@/entities/member'

/**
 * Server Action that creates a new Member and assigns that Member to an already existing Group.
 * 
 * @param {NewMemberDTO} newMemberDTO
 * 
 * @returns {Promise<ServerActionResults<Member>>} ServerActionResults containing the new Member if successful
 */
export async function createNewMemberAndJoinGroupServerAction(newMemberDTO: NewMemberDTO): Promise<ServerActionResults<Member>> {
  const results = await createNewMemberAndJoinGroupAction(newMemberDTO)
  if (results.success) {
    revalidatePath('/', 'layout')
  }

  return results
}
