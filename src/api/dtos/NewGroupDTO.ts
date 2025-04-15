import { isString } from '@/api/utils/validators'

export interface NewGroupDTO {
  name: string
  password?: string
  creator_member_id: string
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
    return "'creator_member_id' field is invalid."
  }

  // Group can require a password to join
  if (isString(password ?? '')) {
    // Group password should be at least 6 characters long
    if (password?.trim().length !== 6) {
      return "'password' should be at least 6 characters long."
    }
  }

  return null
}
