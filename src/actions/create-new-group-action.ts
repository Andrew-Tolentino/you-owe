import { type NewGroupDTO } from '@/api/dtos/NewGroupDTO'
import { ERROR_MESSAGE_FUNCTIONS, HTTP_CODES, HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import { isString, isValidGroupPassword } from '@/api/utils/validators'
import { type Group } from '@/entities/group'
import { type ServerActionResults } from '@/actions/return-types'
import { Members } from '@/models/Members'
import { Groups } from '@/models/Groups'
import Logger from '@/utils/logger'

const LOGGER_PREFIX = '[actions/create-new-group-action]'

/**
 * Creates a new Group given a "NewGroupDTO".
 * During this process checks if the Member trying to create the Group is a valid Member.
 * 
 * @param {NewGroupDTO} { name, password, creator_member_id } fields from a "NewGroupDTO" are required
 * @returns {Promise<ServerActionResults<Group>>} ServerActionResults containing the "Group" entity as the payload
 */
export async function createNewGroupAction({ name, password, creator_member_id }: NewGroupDTO): Promise<ServerActionResults<Group>> {
  // Validate Group data coming in
  const DTOValidationError = validateNewGroupDTO({ name, password, creator_member_id })
  if (DTOValidationError !== null) {
    return { success: false, errorMessage: DTOValidationError, httpCode: HTTP_CODES.BAD_REQUEST }
  }

  const groupName = name.trim()
  const groupPassword = password ? password.trim() : null
  const creatorMemberId = creator_member_id?.trim() as string

  // Check if the 'creator_member_id' belongs to an active Member
  const members = new Members()
  const member = await members.fetchMemberById(creatorMemberId)
  if (member === null || member.deleted_at !== null) {
    Logger.info(`${LOGGER_PREFIX} createNewGroupAction: Unable to create a Group because Member with ID "${creator_member_id}" does not exist.`)
    // TODO: This might not be a friendly error message to display on the frontend. Might need to change this somewhere here or upstream.
    return { success: false, errorMessage: ERROR_MESSAGE_FUNCTIONS.RESOURCE_WITH_ID_NOT_FOUND('Member', creatorMemberId), httpCode: HTTP_CODES.BAD_REQUEST }
  }

  const group = new Groups()
  const newGroup = await group.createGroup({ name: groupName, password: groupPassword, creator_member_id: creatorMemberId })
  if (newGroup !== null) {
    return { success: true, httpCode: HTTP_CODES.CREATED, payload: newGroup }
  }

  Logger.info(`${LOGGER_PREFIX} createNewGroupAction: Unable to create a Group for Member with ID "${creator_member_id}"`)
  return { success: false, errorMessage: HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, httpCode: HTTP_CODES.INTERNAL_SERVER_ERROR }
}

/**
 * Validates an incoming NewGroupDTO checking if the request has fulfilled all
 * checkmarks needed to create a Group.
 * 
 * @param {NewGroupDTO} DTO
 * 
 * @returns {string | null} Returns an error message string if there was an issue found in DTO. Else, returns null.
 */
export function validateNewGroupDTO(DTO: NewGroupDTO): string | null {
  const { name, password, creator_member_id } = DTO

  if (!isString(name)) {
    return "'name' field is invalid."
  }

  if (!isString(creator_member_id)) {
    return HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
  }

  // Validate Groups with passwords if provided
  if (password) {
    const groupPasswordErrorValidationMessage = isValidGroupPassword(password)
    if (groupPasswordErrorValidationMessage !== null) {
      return groupPasswordErrorValidationMessage
    }
  }

  return null
}