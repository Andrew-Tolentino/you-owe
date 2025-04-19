/**
 * Checks if the given argument is of type string.
 * Will apply trimming to the argument as part of the checking.
 * 
 * @param {unknown} str
 * 
 * @returns {boolean} Returns true if string, else false. Also returns false if empty string.
 */
export function isString(str: unknown): boolean {
  if (typeof str !== 'string') {
    return false
  }

  // Check if an empty string
  if (str.trim() === '') {
    return false
  }

  return true
}

/**
 * 
 * @param password 
 * @returns 
 */
export function isValidGroupPassword(password: unknown): string | null {
  if (!isString(password)) {
      return "'password' field is invalid."
  }

  const groupPassword = (password as string).trim()
  if (groupPassword.length < 6) {
    // Group password should be at least 6 characters long
    return "'password' should be at least 6 characters long."
  }

  return null
}
 