/**
 * Checks if the given argument is of type string.
 * 
 * @param {string} str
 * 
 * @returns {boolean} - Returns true if string, else false. Also returns false if empty string.
 */
export function isString(str: string): boolean {
  if (str === '') {
    return false
  }

  if (typeof str !== 'string') {
    return false
  }

  return true
}
