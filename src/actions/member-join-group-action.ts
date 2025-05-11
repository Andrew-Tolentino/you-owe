import { type JoinGroupDTO } from '@/api/dtos/JoinGroupDTO'
import { type ServerActionResults } from '@/types/promise-results-types'
import { Members } from '@/models/Members'
import Logger from '@/utils/logger'
import { ERROR_MESSAGE_FUNCTIONS, HTTP_CODES, HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import { Groups } from '@/models/Groups'

const LOGGER_PREFIX = '[actions/member-join-group-action]'
export const ERROR_MESSAGE_CLOSED_GROUP = "This Group is marked as 'closed' meaning no new Members are able to join at this time."
export const ERROR_MESSAGE_INCORRECT_GROUP_PASSWORD = 'Group password is incorrect, unable to join Group.'
const ERROR_MESSAGE_MEMBER_ALREADY_IN_GROUP = 'Member already belongs to Group.'

/**
 * Links an existing active Member to an existing active Group.
 * 
 * @param {JoinGroupDTO} JoinGroupDTO
 * @returns {Promise<ServerActionResults<null> | null>} ServerActionResults
 */
export async function memberJoinGroupAction({ member_id, group_id, group_password }: JoinGroupDTO): Promise<ServerActionResults<void>> {
  /**
   * 1. Grab Member and confirm they exist and is active
   * 2. Grab Group and confirm it exists and is active and is not closed (meaning people can still join)
   * 3. Create an entry in the members_groups join table
   */

  const members = new Members()
  const member = await members.fetchMemberById(member_id)
  if (member === null || member.deleted_at !== null) {
    Logger.info(`${LOGGER_PREFIX} memberJoinGroupAction: Unable to link Member to Group because Member with ID "${member_id}" doesn't exist or is inactive.`)
    return { success: false, errorMessage: ERROR_MESSAGE_FUNCTIONS.RESOURCE_WITH_ID_NOT_FOUND('Member', member_id), httpCode: HTTP_CODES.BAD_REQUEST }
  }

  const groups = new Groups()
  const group = await groups.fetchGroup(group_id, false)
  if (group === null || group.deleted_at !== null) {
    Logger.info(`${LOGGER_PREFIX} memberJoinGroupAction: Unable to link Member with ID "${member_id}" to Group with ID "${group_id}" because Group doesn't exist or is inactive.`)
    return { success: false, errorMessage: ERROR_MESSAGE_FUNCTIONS.RESOURCE_WITH_ID_NOT_FOUND('Group', group_id), httpCode: HTTP_CODES.BAD_REQUEST }    
  }
  // Check if Group is closed, meaning that people are not able join anymore
  if (group.is_closed) {
    return { success: false, errorMessage: ERROR_MESSAGE_CLOSED_GROUP, httpCode: HTTP_CODES.BAD_REQUEST } 
  }
  
  // Verify Group passwords if needed
  // TODO: In the future these passwords will be hashed
  if (group.password !== null && group.password !== group_password) {
    Logger.info(`${LOGGER_PREFIX} memberJoinGroupAction: Unable to link Member with ID "${member_id}" to Group with ID "${group_id}" due to passwords not matching.`)
    return { success: false, errorMessage: ERROR_MESSAGE_INCORRECT_GROUP_PASSWORD, httpCode: HTTP_CODES.BAD_REQUEST }
  }

  // Verify Member is not already in the Group
  const isMemberAlreadyInGroup = await members.isMemberInGroup(member_id, group_id)
  if (isMemberAlreadyInGroup) {
    Logger.info(`${LOGGER_PREFIX} memberJoinGroupAction: Unable to link Member with ID "${member_id}" to Group with ID "${group_id}" since the Member is already in the Group.`)
    return { success: false, errorMessage: ERROR_MESSAGE_MEMBER_ALREADY_IN_GROUP, httpCode: HTTP_CODES.BAD_REQUEST }
  }

  // Link Member to Group
  const success = groups.linkMemberToGroup(member_id, group_id)
  if (!success) {
    Logger.error(`${LOGGER_PREFIX} memberJoinGroupAction: Member with ID "${member_id}" was not able to join Group with ID ${group_id}`)
    return { success: false, errorMessage: HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, httpCode: HTTP_CODES.INTERNAL_SERVER_ERROR }
  }

  return { success: true }
}
