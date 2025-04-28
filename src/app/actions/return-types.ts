/**
 * Server Action result type that can be used to pass information between server and client.
 */
export interface ServerActionResults {
  /**
   * Whether the server action completed successfully or not.
   */
  success: boolean

  /**
   * Optional - Error message to show the client if the server action failed.
   */
  errorMessage?: string

  /**
   * Optional - Can be used to send miscellaneous information back to the client.
   */
  payload?: unknown
}
