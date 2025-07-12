import { ERROR_MESSAGE_FUNCTIONS, HTTP_CODES, HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import { type Group, type UpdateGroupDTO } from '@/entities/group'
import { Groups } from '@/models/Groups'
import { Members } from '@/models/Members'
import { Users } from '@/models/Users'
import { type ServerActionResults } from '@/types/promise-results-types'
import Logger from '@/utils/logger'

const LOGGER_PREFIX = '[actions/update-group-action]'

/**
 * Updates a Group by first verifying the following:
 *  1. Group exists and has not been deleted
 *  2. Requester is an authenticated User and creator of the Group
 * 
 * @param {UpdateGroupDTO} updateGroupDTO - DTO to update a Group
 * @param {string} groupId - ID associated to the Group
 * 
 * @returns {Promise<ServerActionResults<Group>>} ServerActionResults containing the updated 'Group' in payload if successful
 */
export async function updateGroupAction(updateGroupDTO: UpdateGroupDTO, groupId: string): Promise<ServerActionResults<Group>> {
  // Verify that the requester is authenticated
  const users = new Users()
  const userId = await users.getAuthUserId()

  // There is no user found in request
  if (userId === null) {
    return { success: false, errorMessage: HTTP_ERROR_MESSAGES.UNVERIFIABLE_REQUESTER, httpCode: HTTP_CODES.BAD_REQUEST }
  }

  // Fetch Group given ID
  const groups = new Groups()
  const group = await groups.fetchGroup(groupId)

  // Group does not exist
  if (group === null) {
    return { success: false, errorMessage: ERROR_MESSAGE_FUNCTIONS.RESOURCE_WITH_ID_NOT_FOUND('Group', groupId), httpCode: HTTP_CODES.NOT_FOUND }
  }

  // Group has been deleted
  if (group.deleted_at !== null) {
    return { success: false, errorMessage: ERROR_MESSAGE_FUNCTIONS.RESOURCE_WITH_ID_HAS_BEEN_DELETED('Group', groupId), httpCode: HTTP_CODES.BAD_REQUEST}
  }

  // Fetch Member assoicated to User ID found in request
  const members = new Members()
  const member = await members.fetchMemberByAuthUserId(userId)

  // No Member is found being associated to the User ID. This is an issue interally.
  if (member === null) {
    Logger.error(`${LOGGER_PREFIX} updateGroupAction: Unable to find a Member resource linked to User with ID "${userId}".`)
    return { success: false, errorMessage: HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, httpCode: HTTP_CODES.INTERNAL_SERVER_ERROR }
  }

  // Member has been marked as deleted
  if (member.deleted_at !== null) {
    return { success: false, errorMessage: ERROR_MESSAGE_FUNCTIONS.RESOURCE_NOT_FOUND('User'), httpCode: HTTP_CODES.BAD_REQUEST }
  }

  // Member did not create Group
  if (member.id !== group.creator_member_id) {
    return { success: false, errorMessage: ERROR_MESSAGE_FUNCTIONS.RESOURCE_NOT_CREATED_BY_USER('Group'), httpCode: HTTP_CODES.BAD_REQUEST }
  }

  // Update Group
  const groupUpdates: Partial<Group> = {}
  if (updateGroupDTO.is_closed !== undefined) {
    groupUpdates.is_closed = updateGroupDTO.is_closed
  }

  const updatedGroup = await groups.updateGroupById(groupId, groupUpdates)
  if (updatedGroup === null) {
    Logger.error(`${LOGGER_PREFIX} updateGroupAction: Unable to update Group with ID "${groupId}" created by User with ID "${userId}".`)
    return { success: false, errorMessage: HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, httpCode: HTTP_CODES.INTERNAL_SERVER_ERROR }
  }

  return { success: true, payload: updatedGroup, httpCode: HTTP_CODES.OK }
}
