import { supabaseCreateServerClient } from '@/api/clients/supabase/supabase-server-client'
import { type NewGroupDTO } from '@/api/dtos/NewGroupDTO'
import { type NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import Logger from '@/utils/logger'
import { isString, isValidGroupPassword } from '@/api/utils/validators'
import { type DBClient } from '@/db/db-client'
import { PROC_CREATE_NEW_MEMBER_AND_GROUP, type ProcCreateNewMemberAndGroupParameters, type ProcCreateNewMemberAndGroupQuery } from '@/db/stored-procedures'
import { SupabaseDBClient } from '@/db/supabase-client'
import { type ServerActionResults } from '@/actions/return-types'
import { HTTP_CODES, HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import { type Group } from '@/entities/group'
import { type Member } from '@/entities/member'

const LOGGER_PREFIX = '[actions/create-new-member-and-group-action]'

/**
 * Payload returned after successfully calling the "createNewMemberAndGroupAction" action.
 */
interface CreateNewMemberAndGroupActionPayload {
  member: Partial<Member>
  group: Partial<Group>
}
export { type CreateNewMemberAndGroupActionPayload }

/**
 * Does the following:
 *  1. Creates a new Supabase user.
 *  2. Creates a new Member and ties the Member to the newly created Supabase user.
 *  3. Creates a new Group with the newly created Member as the Group creator and ties the new Group to the Member.
 * 
 * @param {NewMemberDTO} newMemberDTO 
 * @param {NewGroupDTO} newGroupDTO 
 * @returns {Promise<ServerActionResults<CreateNewMemberAndGroupActionPayload>>} ServerActionResults containing the "CreateNewMemberAndGroupActionPayload" as the payload
 */
export async function createNewMemberAndGroupAction(newMemberDTO: NewMemberDTO, newGroupDTO: NewGroupDTO): Promise<ServerActionResults<CreateNewMemberAndGroupActionPayload>> {
  // Validate DTOs
 const DTOValidationError = validateNewMemberAndNewGroupDTO(newMemberDTO, newGroupDTO)
  if (DTOValidationError !== null) {
    return { success: false, errorMessage: DTOValidationError, httpCode: HTTP_CODES.BAD_REQUEST }
  }

  // Create Supabase anonymous user
  const supabaseClient = await supabaseCreateServerClient()
  const { data, error } = await supabaseClient.auth.signInAnonymously()
  if (error !== null) {
    Logger.error(`${LOGGER_PREFIX} createNewMemberAndGroupAction: Error when creating an anonymous user. Error code: ${error.code} and message: ${error.message}.`)
    return { success: false, errorMessage: HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, httpCode: HTTP_CODES.INTERNAL_SERVER_ERROR }
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
      const newMember: Partial<Member> = { id: resultQuery.member_id, name: resultQuery.member_name, created_at: resultQuery.member_created_at}
      const newGroup: Partial<Group> = { id: resultQuery.group_id, name: resultQuery.group_name, created_at: resultQuery.group_created_at, creator_member_id: resultQuery.member_id }

      return { success: true, httpCode: HTTP_CODES.CREATED, payload: { member: newMember, group: newGroup } }
    }
  }

  Logger.error(`${LOGGER_PREFIX} createNewMemberAndGroupAction: Result query after running RPC returned null. User who called server action has id - ${data.user?.id}.`)
  return { success: false, errorMessage: HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, httpCode: HTTP_CODES.INTERNAL_SERVER_ERROR }
}

/**
 * Validates the incoming DTO for creating a new Member and Group.
 * 
 * @param {NewMemberDTO} member 
 * @param {NewGroupDTO} group 
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
  if (group.password && group.password?.trim() !== '') {
    const groupPasswordErrorValidationMessage = isValidGroupPassword(group.password)
    if (groupPasswordErrorValidationMessage !== null) {
      return groupPasswordErrorValidationMessage
    }
  }

  return null
}
