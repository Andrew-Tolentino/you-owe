import { isString } from '@/api/utils/validators'

/**
 * DTO that can be used to create a Group.
 */
interface NewGroupDTO {
  /**
   * Name of the new Group.
   */
  name: string

  /**
   * Optional - Password to join the new Group.
   * If not set, any Member can join the Group.
   */
  password?: string | null

  /**
   * Optional - There are other ways of creating a Group where the Member ID is not needed (new user creating a Group for the first time).
   * ID of Member who is creating the Group.
   */
  creator_member_id?: string
}

export type { NewGroupDTO }

/**
 * Validates an incoming NewGroupDTO checking if the request has fulfilled all
 * checkmarks needed to create a Group.
 * 
 * @param {NewGroupDTO} DTO
 * 
 * @returns {string | null} Returns an error message string if there was an issue found in DTO. Else, returns null.
 */
export function validateNewGroupDTO(DTO: NewGroupDTO): string | null {
  const { name, password } = DTO

  if (!isString(name)) {
    return "'name' field is invalid."
  }

  // Group can require a password to join
  if (password) {
    if (isString(password)) {
      // Group password should be at least 6 characters long
      if (password!.trim().length < 6) {
        return "'password' should be at least 6 characters long."
      }
    } else {
      // password field does have a value but is not a string
      return "'password' field is invalid."
    }
  }

  return null
}
