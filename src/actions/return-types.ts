/**
 * Server Action result type that can be used to pass information between server and client.
 */
interface ServerActionResults<T> {
  /**
   * Whether the server action completed successfully or not.
   */
  success: boolean

  /**
   * Optional - Error message to show the client if the server action failed.
   */
  errorMessage?: string

  /**
   * Optional - HTTP Code representing the results of the action that can be used to send in a response.
   */
  httpCode?: number

  /**
   * Optional - Can be used to send miscellaneous information back to the client.
   */
  payload?: T
}

export { type ServerActionResults }
