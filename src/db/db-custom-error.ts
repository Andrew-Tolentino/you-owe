/** Error mapping use when making a Database interaction that fails. */
interface DatabaseError {
  clientMessage: string
  errorType: CUSTOM_DATABASE_ERRORS
  details: string
  code?: string
}
export { type DatabaseError  }

/** Mapping of custom database errors used to categorize errors sent from Database calls. */
export enum CUSTOM_DATABASE_ERRORS {
  /** Database error when a client argument is invalid. */
  CUSTOM_VALIDATION_ERROR = 'CUSTOM_VALIDATION_ERROR',

  /** Database error when a resource involved is not found or has been deleted (soft deleted). */
  CUSTOM_RESOURCE_NOT_FOUND_ERROR = 'CUSTOM_RESOURCE_NOT_FOUND_ERROR',

  /** Default/fallback when database error is not client related. */
  INTERVAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

export const DATABASE_SQL_STATE_CUSTOM_ERROR_CODE = '45000'
