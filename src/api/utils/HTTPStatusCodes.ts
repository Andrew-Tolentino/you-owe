import { CUSTOM_DATABASE_ERRORS } from '@/db/db-custom-error'

/** Constant values for all used HTTP Codes. */
export const HTTP_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

/** 
 * Returns the appropriate HTTP code given a CUSTOM_DATABASE_ERRORS. 
 */
export function getHttpCodeFromCustomDatabaseError(databaseErrorType: CUSTOM_DATABASE_ERRORS): number {
  switch (databaseErrorType) {
    case CUSTOM_DATABASE_ERRORS.CUSTOM_VALIDATION_ERROR:
      return HTTP_CODES.BAD_REQUEST
    case CUSTOM_DATABASE_ERRORS.CUSTOM_RESOURCE_NOT_FOUND_ERROR:
      return HTTP_CODES.NOT_FOUND
    default: 
      return HTTP_CODES.INTERNAL_SERVER_ERROR
  }
}

export const HTTP_ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Looks like an error on our side. Sorry about that!',
  UNVERIFIABLE_REQUESTER: 'Cannot find User within request.'
}

export const ERROR_MESSAGE_FUNCTIONS = {
  RESOURCE_WITH_ID_NOT_FOUND: (resourceName: string, id: string) => `${resourceName} with id ${id} could not be found.`
}
