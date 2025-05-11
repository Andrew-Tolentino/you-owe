import { NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { isString } from '@/api/utils/validators'
import { ServerActionResults } from '@/actions/return-types'
import { ERROR_MESSAGE_CLOSED_GROUP, ERROR_MESSAGE_INCORRECT_GROUP_PASSWORD } from '@/actions/member-join-group-action'
import { ERROR_MESSAGE_FUNCTIONS, HTTP_CODES, HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import { Groups } from '@/models/Groups'
import { Group } from '@/entities/group'
import { supabaseCreateServerClient } from '@/api/clients/supabase/supabase-server-client'
import Logger from '@/utils/logger'
import { Members } from '@/models/Members'
import { type ProcCreateNewMemberAndLinkToMemberGroupsParameters } from '@/db/stored-procedures'
import { Member } from '@/entities/member'

const LOGGER_PREFIX = '[actions/create-new-member-and-join-group-action]'

export async function createNewMemberAndJoinGroupAction({ name, group_id, group_password }: NewMemberDTO): Promise<ServerActionResults<Member>> {
  const validationError = validateNewMemberDTO({ name, group_id, group_password })
  if (validationError !== null) {
    return { success: false, errorMessage: validationError, httpCode: HTTP_CODES.BAD_REQUEST }
  }

  // Trim DTO
  const newMemberDTO: NewMemberDTO = { name: name.trim(), group_id: group_id?.trim(), group_password: group_password?.trim() }

  // Verify that the 'group_id' belongs to an active Group
  const groups = new Groups()
  const group: Group | null = await groups.fetchGroup(newMemberDTO.group_id as string, false)
  if (group === null || group.deleted_at !== null) {
    return { success: false, errorMessage: ERROR_MESSAGE_FUNCTIONS.RESOURCE_WITH_ID_NOT_FOUND('Group', newMemberDTO.group_id as string), httpCode: HTTP_CODES.BAD_REQUEST } 
  }

  // Check if Group is closed, meaning that people are not able join anymore
  if (group.is_closed) {
    return { success: false, errorMessage: ERROR_MESSAGE_CLOSED_GROUP, httpCode: HTTP_CODES.BAD_REQUEST } 
  }

  // Verify Group passwords if needed
  // TODO: In the future these passwords will be hashed
  if (group.password !== null && group.password !== group_password) {
    Logger.info(`${LOGGER_PREFIX} createNewMemberAndJoinGroupAction: Unable to complete action due to mismatch in Group's password and the password within the request.`)
    return { success: false, errorMessage: ERROR_MESSAGE_INCORRECT_GROUP_PASSWORD, httpCode: HTTP_CODES.BAD_REQUEST }
  }
 
  // Create anonymous user
  const supabaseClient = await supabaseCreateServerClient()
  const { data, error } = await supabaseClient.auth.signInAnonymously()
  if (error !== null) {
    Logger.error(`${LOGGER_PREFIX} createNewMemberAndJoinGroupAction: Error when creating an anonymous user. Error code: ${error.code} and message: ${error.message}`)
    return { success: false, errorMessage: HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, httpCode: HTTP_CODES.INTERNAL_SERVER_ERROR } 
  }

  if (data.user) {
    const members = new Members()
    const member = await members.createMember(newMemberDTO.name, newMemberDTO.group_id as string, data.user.id)
    if (member !== null) {
      return { success: true, httpCode: HTTP_CODES.CREATED ,payload: member }
    }
  }

  Logger.error(`${LOGGER_PREFIX} createNewMemberAndJoinGroupAction: Unable to create Member and link to Group. Data used in action - ${JSON.stringify({ name, group_id, group_password, auth_user_id: data?.user?.id })}`)
  return { success: false, errorMessage: HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, httpCode: HTTP_CODES.INTERNAL_SERVER_ERROR }
}

/**
 * Validates an incoming NewMemberDTO checking if the request has fulfilled all
 * checkmarks needed to create a Member.
 * 
 * @param {NewMemberDTO} DTO
 * 
 * @returns {string | null} Returns an error message string if there was an issue found in DTO. Else, returns null.
 */
function validateNewMemberDTO(DTO: NewMemberDTO): string | null {
  const { name, group_id } = DTO
  if (!isString(name)) {
    return "'name' field is invalid."
  }

  if (!isString(group_id)) {
    return "'group_id' field is invalid."
  }

  return null
}
