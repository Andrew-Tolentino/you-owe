"use server"

import { revalidatePath } from 'next/cache'

import { memberJoinGroupAction } from '@/actions/member-join-group-action'
import { ServerActionResults } from '@/actions/return-types'
import { JoinGroupDTO } from '@/api/dtos/JoinGroupDTO'

export async function memberJoinGroupServerAction(joinGroupDTO: JoinGroupDTO): Promise<ServerActionResults<void>> {
  const results = await memberJoinGroupAction(joinGroupDTO)
  if (results.success) {
    revalidatePath('/', 'layout')
  }

  return results
}
