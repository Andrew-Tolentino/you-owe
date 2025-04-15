/** Constant values for all used HTTP Codes. */
export const HTTP_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

export const HTTP_ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Looks like an error on our side. Sorry about that!',
}

export const ERROR_MESSAGE_FUNCTIONS = {
  RESOURCE_WITH_ID_NOT_FOUND: (resourceName: string, id: string) => `${resourceName} with id ${id} could not be found.`
}