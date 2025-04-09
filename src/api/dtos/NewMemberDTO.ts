import { isString } from '@/api/utils/validators'

export interface NewMemberDTO {
  name: string
}

/**
 * Validates an incoming NewMemberDTO checking if the request has fulfilled all
 * checkmarks needed to create a Member.
 * 
 * @param {NewMemberDTO} DTO
 * 
 * @returns {string | null} Returns an error message string if there was an issue found in DTO. Else, returns null.
 */
export function validateNewMemberDTO(DTO: NewMemberDTO): string | null {
  const { name } = DTO
  if (!isString(name)) {
    return "'name' field is invalid."
  }

  return null
}
