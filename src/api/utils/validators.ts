/**
 * Checks if the given argument is of type string.
 * Will apply trimming to the argument as part of the checking.
 * 
 * @param {string} str
 * 
 * @returns {boolean} Returns true if string, else false. Also returns false if empty string.
 */
export function isString(str: string): boolean {
  if (typeof str !== 'string') {
    return false
  }

  // Check if an empty string
  if (str.trim() === '') {
    return false
  }

  return true
}
