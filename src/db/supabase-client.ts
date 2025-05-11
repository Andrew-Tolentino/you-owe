import { SupabaseClient } from '@supabase/supabase-js'
import { PostgrestError, PostgrestFilterBuilder } from '@supabase/postgrest-js';

import { type DBFilterMap, FilterOperator, type DBClient } from '@/db/db-client'
import { type YouOweEntity } from '@/entities/entity'
import { supabaseCreateServerClient } from '@/api/clients/supabase/supabase-server-client'
import Logger from '@/utils/logger'

import { CUSTOM_DATABASE_ERRORS, DATABASE_SQL_STATE_CUSTOM_ERROR_CODE, DatabaseError } from '@/db/db-custom-error'
import { HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import { type StoredProcedureResults } from '@/types/promise-results-types'

const LOGGER_PREFIX = '[db/supabase-client]'

/** Mapping to help typecast Supabase resultant queries for one:many relationships */
type OneToManySupabaseMapping<T,U> =  T & {
  [key: string]: { [key]: U }[]
}

export class SupabaseDBClient implements DBClient {
  private _supabaseClient: SupabaseClient | null = null

  /**
   * Initializes the supabase client if it has not been set already
   */
  private async getSupabaseClient(): Promise<SupabaseClient> {
    if (this._supabaseClient === null) {
      this._supabaseClient = await supabaseCreateServerClient()
    }

    return this._supabaseClient
  }

  /**
   * Uses the Supabase client to get rows from a table given a primary key ID.
   * 
   * @param {string} tableName - Table to get rows from 
   * @param {string} id - Primary key ID associated to rows
   * 
   * @returns {Promise<YouOweEntity[] | null>} The rows found in the table. If an error occurs, returns null.
   */
  async getEntityById(tableName: string, id: string): Promise<YouOweEntity[] | null> {
    const supabaseClient = await this.getSupabaseClient()
    const { data, error } = await supabaseClient.from(tableName).select().eq('id', id)

    if (error) {
      Logger.error(`${LOGGER_PREFIX} getEntityById: Error thrown when finding entity with id "${id}" from the "${tableName}" table/view. Error code: "${error.code}" and message: "${error.message}".`)
      return null
    }

    return data as YouOweEntity[]
  }

  /**
   * Uses the Supabase client to get a row from a table given database filters.
   *  
   * @param {string} tableName - Table to get rows from 
   * @param {dbFilters} dbFilters - Filters to be applied to the query
   * 
   * @returns {Promise<YouOweEntity[] | null>} The rows found in the table. If an error occurs, returns null.
   */
  async getEntityByDBFilters(tableName: string, dbFilters: DBFilterMap[]): Promise<YouOweEntity[] | null> {
    const supabaseClient = await this.getSupabaseClient()
    let supabaseQueryBuilder = supabaseClient.from(tableName).select()
    supabaseQueryBuilder = this.applyDBFilters(supabaseQueryBuilder, dbFilters)

    const { data, error } = await supabaseQueryBuilder

    if (error) {
      Logger.error(`${LOGGER_PREFIX} getEntityByDBFilters: Error thrown when finding entity from the "${tableName}" table/view. Database filters used - ${JSON.stringify(dbFilters)}. Error code: "${error.code}" and message: "${error.message}".`)
      return null
    }

    return data as YouOweEntity[]
  }

  /**
   * Uses the Supabase client to get rows from a table given an auth_user_id.
   * 
   * @param {string} tableName - Table to get rows from 
   * @param {string} authUserId - Unique ID associated to the rows
   * 
   * @returns {Promise<YouOweEntity[] | null>} The rows found in the table. If an error occurs, returns null.
   */
  async getEntityByAuthUserId(tableName: string, authUserId: string): Promise<YouOweEntity[] | null> {
    const supabaseClient = await this.getSupabaseClient()
    const { data, error } = await supabaseClient.from(tableName).select().eq('auth_user_id', authUserId)

    if (error) {
      Logger.error(`${LOGGER_PREFIX} getEntityByAuthUserId: Error thrown when finding entity with auth_user_id "${authUserId}" from the "${tableName}" table/view. Error code: "${error.code}" and message: "${error.message}".`)
      return null
    }

    return data as YouOweEntity[]
  }

  /**
   * Uses the Supabase client to make aa new row into a table.
   * 
   * @param {string} tableName - Table to create a new entity in.
   * @param {Partial<YouOweEntity>} entity - Object representing the new row that will be inserted into the table.
   * 
   * @returns {Promise<YouOweEntity | null>} If successful, returns the entity created. Else, returns null.
   */
  async createEntity(tableName: string, entity: Partial<YouOweEntity>): Promise<YouOweEntity | null> {
    const supabaseClient = await this.getSupabaseClient()
    const { data, error, status, statusText } =  await supabaseClient.from(tableName).insert(entity).select()

    if (error) {
      Logger.error(`${LOGGER_PREFIX} createEntity: Error thrown when creating an entity in the "${tableName}" table/view. Error code: "${error.code}" and message: "${error.message}". Printing out API status ${status} and status text ${statusText}`)
      return null
    }
    
    return data[0] as YouOweEntity
  }

  /**
   * Uses the Supabase client to soft delete a row in a table. This will pooulate the 'deleted_at' column in the row.
   * 
   * @param {string} tableName - Table to delete a row from 
   * @param {string} id - Unique ID associated to the row
   * 
   * @returns {Promise<boolean>} Whether or not we were able to soft delete the row.
   */
  async deleteEntityById(tableName: string, id: string): Promise<boolean> {
    const supabaseClient = await this.getSupabaseClient()
    const date = new Date(Date.now())
    const { error } = await supabaseClient.from(tableName).update({ 'deleted_at':  date.toISOString() }).eq('id', id)

    if (error) {
      Logger.error(`${LOGGER_PREFIX} deleteEntityById: Error thrown when creating deleting an entity in the "${tableName}" table/view. Error code: "${error.code}" and message: "${error.message}".`)
      return false
    }

    return true
  }

  /**
   * Uses the Supabase client to invoke a stored procedure with the expectation of a return value.
   * 
   * @param {string} procName - Name of the stored procedure to be executed
   * @param {object?} parameters - Object containing arguments that is needed for stored procedure
   * 
   * @returns {Promise<StoredProcedureResults<T>>} Returns StoredProcedureResults of type T where T will be the payload value if stored procedure finished successfully
   */
  async invokeStoredProcedure<T>(procName: string, parameters?: object): Promise<StoredProcedureResults<T>> {
    const supabaseClient = await this.getSupabaseClient()
    let databaseError: DatabaseError | null = null
    const { data, error } = parameters ? await supabaseClient.rpc(procName, parameters) : await supabaseClient.rpc(procName)
    if (error) {
      Logger.error(`${LOGGER_PREFIX} invokeStoredProcedure: Error when calling stored procedure "${procName}" with parameters ${JSON.stringify(parameters)}. Error code: "${error.code}" and message: "${error.message}".`)
      const isCustomDatabaseError = this.isSQLStateCustomError(error)
      databaseError = { 
        code: error.code,
        errorType: this.getCustomDatabaseError(error),
        clientMessage: isCustomDatabaseError ? error.message : HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        details: isCustomDatabaseError ? error.details : error.message
      }

      return { success: false, databaseError } as StoredProcedureResults<T>
    }

    return { success: true, databaseError: null, payload: data as T } as StoredProcedureResults<T>
  }

  /**
   * Uses the Supabase client to invoke a stored procedure with the expectation of no return value.
   * 
   * @param {string} procName - Name of the stored procedure to be executed. 
   * @param {object?} parameters - Object containing arguments that is needed for stored procedure.
   * 
   * @returns {Promise<boolean>} Returns true if stored procedure executed successfully, else false.
   */
  async invokeStoredProcedureVoid(procName: string, parameters?: object): Promise<boolean> {
    const supabaseClient = await this.getSupabaseClient()
    const { data, error } = parameters ? await supabaseClient.rpc(procName, parameters) : await supabaseClient.rpc(procName)
    if (error) {
      Logger.error(`${LOGGER_PREFIX} invokeStoredProcedureVoid: Error when calling stored procedure. Error code: "${error.code}" and message: "${error.message}".`)
      return false
    }

    if (data.status !== 200) {
      Logger.info(`${LOGGER_PREFIX} invokeStoredProcedureVoid: Failed to return a success status after executed store procedure '${procName}' using the following arguments ${parameters ? JSON.stringify(parameters) : ''}. Status code received '${data.status}' and status text received '${data.statusText}'.`)
      return false
    }

    return true
  }

  /**
   * Uses the Supabase client to get a one:many query result. 
   * 
   * @param {string} singleRelationTableName - Table name that has the one mapping
   * @param {string} manyRelationTableName - Table name that 
   * @param {string} joinTableName - Join Table name used for the many:many mapping
   * @param {DBFilterMap[]} dbFilters - Filters (equal/greater than/etc) that can be applied to the query
   * 
   * @returns {Promise<{ [key: string]: T | U[] } | null>} Returns a map containing information
   */
  async getOneToManyEntities<T extends YouOweEntity, U extends YouOweEntity>(singleRelationTableName: string, manyRelationTableName: string, joinTableName: string, dbFilters: DBFilterMap[] = []): Promise<{ [key: string]: T | U[] } | null> {
    const supabaseClient = await this.getSupabaseClient()
    const queryString = 
    `
    *,
    ${joinTableName} (
      ${manyRelationTableName} ( * )
    )
    `
    let supabaseQueryBuilder = supabaseClient.from(singleRelationTableName).select(queryString)
    supabaseQueryBuilder = this.applyDBFilters(supabaseQueryBuilder, dbFilters)
    supabaseQueryBuilder.single()

    const { data, error } =  await supabaseQueryBuilder
    if (error) {
      Logger.error(`${LOGGER_PREFIX} getOneToManyEntities: Error when querying with the following tables - ${singleRelationTableName}, ${manyRelationTableName}, and ${joinTableName}. Filters being applied - ${JSON.stringify(dbFilters)}. Error code: ${error.code} and message ${error.message}.`)
      return null
    }

    if (!data) {
      Logger.info(`${LOGGER_PREFIX} getOneToManyEntities: No many:many data found for the following tables - ${singleRelationTableName}, ${manyRelationTableName}, and ${joinTableName}. Filters being applied - ${JSON.stringify(dbFilters)}.`)
      return { [singleRelationTableName]: [], [manyRelationTableName]: [] }
    }

    const transformedData = data as unknown as OneToManySupabaseMapping<T, U>
    return {
      [singleRelationTableName]: transformedData,
      [manyRelationTableName]: transformedData[joinTableName].map((val) => val[manyRelationTableName])
    }
  }

  /**
   * Helper method use to apply database filters to a Supabase query.
   * 
   * @param {PostgrestFilterBuilder<any, any, any[], string, unknown>} queryBuilder - Supabase query builder
   * @param {DBFilterMap[]} dbFilters - Database filters to be applied
   * 
   * @returns {PostgrestFilterBuilder<any, any, any[], string, unknown>} the same 'queryBuilder' argument with the applied dabatase filters
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyDBFilters(queryBuilder: PostgrestFilterBuilder<any, any, any[], string, unknown>, dbFilters: DBFilterMap[]): PostgrestFilterBuilder<any, any, any[], string, unknown> {
    dbFilters.forEach((val) => {
      const { column, value, operator } = val
      if (operator === FilterOperator.EQUALS) {
        queryBuilder.eq(column, value)
      }
    })

    return queryBuilder
  }

  /**
   * Helper method that checks the PostgresError type returned from Supabase and returns the specific error type if possible.
   * If the PostgresError is a custom one, then the error code should be '45000'.
   * 
   * @param {string} errorStr - Error hint from Database.
   *  
   * @returns {CUSTOM_DATABASE_ERRORS} enum mapping to the custom database error 
   */
  private getCustomDatabaseError(postgresError: PostgrestError): CUSTOM_DATABASE_ERRORS {
    // Check if the error is a custom one
    if (!this.isSQLStateCustomError(postgresError)) {
      return CUSTOM_DATABASE_ERRORS.INTERVAL_SERVER_ERROR
    }

    switch(postgresError.hint) {
      case CUSTOM_DATABASE_ERRORS.CUSTOM_RESOURCE_NOT_FOUND_ERROR:
        return CUSTOM_DATABASE_ERRORS.CUSTOM_RESOURCE_NOT_FOUND_ERROR
      case CUSTOM_DATABASE_ERRORS.CUSTOM_VALIDATION_ERROR:
        return CUSTOM_DATABASE_ERRORS.CUSTOM_VALIDATION_ERROR
      default: {
        Logger.info(`${LOGGER_PREFIX} getCustomDatabaseError: Did not account for custom PostgresError from Supabase. Error found - ${JSON.stringify(postgresError)}.`)
        return CUSTOM_DATABASE_ERRORS.INTERVAL_SERVER_ERROR
      }
    }
  }

  /** Helper method to detect if the database error is a custom error which would then contain client friendly error messages. */
  private isSQLStateCustomError(postgresError: PostgrestError): boolean {
    return postgresError.code === DATABASE_SQL_STATE_CUSTOM_ERROR_CODE
  }
}
