import { DatabaseError } from '@/db/db-custom-error'

/**
 * A type that can be use as return type for functions that can error out.
 * This is an alternative to throwing errors.
 */
interface PromiseResults<T> {
  /**
   * Flag indicating whether the function finished completely.
   */
  success: boolean

  /**
   * Optional
   * 
   * Return type of the function that we want to send back to the invoker.
   */
  payload?: T
}

/**
 * A PromiseResults type that is use by RPCs that can pass information to the client (i.e. Backend/Frontend).
 * This can contain information such as custom errors thrown by the database that can then be shown to the client.
 */
interface StoredProcedureResults<T> extends PromiseResults<T> {
  /**
   * Optional
   * 
   * Error from the database if the RPC threw an error.
   */
  databaseError: DatabaseError | null
}
export { type StoredProcedureResults }

/**
 * A PromiseResults type that NextJS Server Actions use to pass information between server and client.
 * This is also use for the NextJS APIs too, which implicitly just invokes functions that Server Actions use.
 */
interface ServerActionResults<T> extends PromiseResults<T> {
  /**
   * Optional
   * 
   * Error message to show the client if the server action failed.
   */
  errorMessage?: string

  /**
   * Optional
   * 
   * HTTP Code representing the results of the action that can be used to send in an HTTP response.
   */
  httpCode?: number
}
export { type ServerActionResults }
