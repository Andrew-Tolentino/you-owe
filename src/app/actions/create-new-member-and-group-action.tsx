"use server"

import { SUPABASE_CLIENT } from '@/api/clients/clients'
import { type NewGroupDTO } from '@/api/dtos/NewGroupDTO'
import { type NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import Logger from '@/utils/logger'
import { isString, isValidGroupPassword } from '@/api/utils/validators'
import { type DBClient } from '@/db/db-client'
import { PROC_CREATE_NEW_MEMBER_AND_GROUP, type ProcCreateNewMemberAndGroupParameters, type ProcCreateNewMemberAndGroupQuery } from '@/db/stored-procedures'
import { SupabaseDBClient } from '@/db/supabase-client'
import { ServerActionResults } from '@/app/actions/return-types'
import { HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import { type Groups } from '@/entities/groups'
import { type Members } from '@/entities/members'

const LOGGER_PREFIX = '[app/actions/create-new-member-and-group-action]'

export async function createNewMemberAndGroup(newMemberDTO: NewMemberDTO, newGroupDTO: NewGroupDTO): Promise<ServerActionResults> {
  // Validate DTOs
 const DTOValidationError = validateNewMemberAndNewGroupDTO(newMemberDTO, newGroupDTO)
  if (DTOValidationError !== null) {
    return { success: false, errorMessage: DTOValidationError } as ServerActionResults
  }

  // Create Supabase anonymous user
  // TODO: Need to see if I need to send in any auth tokens stuff back to client
  const { data, error } = await SUPABASE_CLIENT.auth.signInAnonymously()
  if (error !== null) {
    Logger.error(`${LOGGER_PREFIX} createNewMemberAndGroup: Error when creating an anonymous user. Error code: ${error.code} and message: ${error.message}.`)
    return { success: false, errorMessage: HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR }
  }

  // Now that an anonymous user has been created, create the new Member and Group entities
  if (data.user) {
    const db: DBClient = new SupabaseDBClient()
    const procParams: ProcCreateNewMemberAndGroupParameters = {
      new_member_name: newMemberDTO.name.trim(),
      new_group_name: newGroupDTO.name.trim(),
      new_group_password: newGroupDTO.password ? newGroupDTO.password.trim() : null,
      auth_user_id: data.user.id
    }

    const resultQueryArr = await db.invokeStoredProcedure(PROC_CREATE_NEW_MEMBER_AND_GROUP, procParams) as ProcCreateNewMemberAndGroupQuery[]
    if (resultQueryArr !== null) {
      const resultQuery = resultQueryArr[0]
      const newMember: Partial<Members> = { id: resultQuery.member_id, name: resultQuery.member_name, created_at: resultQuery.member_created_at}
      const newGroup: Partial<Groups> = { id: resultQuery.group_id, name: resultQuery.group_name, created_at: resultQuery.group_created_at, creator_member_id: resultQuery.member_id }
      return { success: true, payload: { member: newMember, group: newGroup } }
    }
  }

  Logger.error(`${LOGGER_PREFIX} createNewMemberAndGroup: Result query after running RPC returned null. User who called server action has id - ${data.user?.id}.`)
  return { success: false, errorMessage: HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR }
}

// TODO: Refactor to make this reusable both here and in the API endpoint
/**
 * Validates the incoming DTO for creating a new Member and Group.
 * 
 * @param {NewMemberAndNewGroupDTO} DTO 
 * @returns {string | null} Returns a string if a field is invalid. Else, null.
 */
function validateNewMemberAndNewGroupDTO(member: NewMemberDTO, group: NewGroupDTO): string | null {
  
  // Validate member DTO
  if (!isString(member.name)) {
    return "'name' field is invalid for Member."
  }

  // Validate group DTO
  if (!isString(group.name)) {
    return "'name' field is invalid for Group."
  }

  // Group can set a password to join
  const groupPasswordErrorValidationMessage = isValidGroupPassword(group.password)
  if (groupPasswordErrorValidationMessage !== null) {
    return groupPasswordErrorValidationMessage
  }

  return null
}
