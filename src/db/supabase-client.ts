import { type DBClient } from '@/db/db-client'
import { type YouOweEntity } from '@/entities/entity'
import { SUPABASE_CLIENT } from '@/api/clients/clients'
import Logger from '@/api/utils/logger'

const LOGGER_PREFIX = '[db/supabase-client]' 

export class SupabaseDBClient implements DBClient {
  /**
   * Uses the Supabase client to get a row from a table given a unique ID.
   * 
   * @param {string} tableName - Table to get a row from 
   * @param {string} id - Unique ID associated to the row 
   * @returns {Promise<YouOweEntity | null>} - The row found in the table. If nothing is found, returns null.
   */
  async getEntityById(tableName: string, id: string): Promise<YouOweEntity | null> {
    const { data, error } = await SUPABASE_CLIENT.from(tableName).select().eq('id', id)

    if (error) {
      Logger.error(`${LOGGER_PREFIX} getEntityById: Error thrown when finding entity with id "${id}" from the "${tableName}" table/view. Error code: "${error.code}" and message: "${error.message}".`)
      return null
    }

    if (data.length === 0) {
      Logger.info(`${LOGGER_PREFIX} getEntityById: Could not find entity with id "${id}" from the "${tableName}" table/view.`)
      return null
    }

    return data[0] as YouOweEntity
  }

  /**
   * Uses the Supabase client to get a row from a table given an auth_user_id.
   * 
   * @param {string} tableName - Table to get a row from 
   * @param {string} authUserId - Unique ID associated to the row 
   * @returns {Promise<YouOweEntity | null>} - The row found in the table. If nothing is found, returns null.
   */
  async getEntityByAuthUserId(tableName: string, authUserId: string): Promise<YouOweEntity | null> {
    const { data, error } = await SUPABASE_CLIENT.from(tableName).select().eq('auth_user_id', authUserId)

    if (error) {
      Logger.error(`${LOGGER_PREFIX} getEntityByAuthUserId: Error thrown when finding entity with auth_user_id "${authUserId}" from the "${tableName}" table/view. Error code: "${error.code}" and message: "${error.message}".`)
      return null
    }

    if (data.length === 0) {
      Logger.info(`${LOGGER_PREFIX} getEntityById: Could not find entity with auth_user_id "${authUserId}" from the "${tableName}" table/view.`)
      return null
    }

    return data[0] as YouOweEntity
  }

  /**
   * Uses the Supabase client to make aa new row into a table.
   * 
   * @param {string} tableName - Table to create a new entity in.
   * @param {Partial<YouOweEntity>} entity - Object representing the new row that will be inserted into the table.
   * 
   * @returns {Promise<YouOweEntity | null>} - If successful, returns the entity created. Else, returns null.
   */
  async createEntity(tableName: string, entity: Partial<YouOweEntity>): Promise<YouOweEntity | null> {
    const { data, error, status, statusText } =  await SUPABASE_CLIENT.from(tableName).insert(entity).select()

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
   * @returns {Promise<boolean>} whether or not we were able to soft delete the row.
   */
  async deleteEntityById(tableName: string, id: string): Promise<boolean> {
    const date = new Date(Date.now())
    const { error } = await SUPABASE_CLIENT.from(tableName).update({ 'deleted_at':  date.toISOString() }).eq('id', id)

    if (error) {
      Logger.error(`${LOGGER_PREFIX} deleteEntityById: Error thrown when creating deleting an entity in the "${tableName}" table/view. Error code: "${error.code}" and message: "${error.message}".`)
      return false
    }

    return true
  }

  /**
   * Uses the Supabase client to invoke a stored procedure with the expectation of a return value.
   * 
   * @param {string} procName - Name of the stored procedure to be executed. 
   * @param {object?} parameters - Object containing arguments that is needed for stored procedure.
   * 
   * @returns {Promise<object | null>} Returns object of proc returned values if successfull or null if stored procedure failed.
   */
  async invokeStoredProcedure(procName: string, parameters?: object): Promise<unknown | null> {
    const { data, error } = parameters ? await SUPABASE_CLIENT.rpc(procName, parameters) : await SUPABASE_CLIENT.rpc(procName)
    if (error) {
      Logger.error(`${LOGGER_PREFIX} invokeStoredProcedure: Error when calling stored procedure. Error code: "${error.code}" and message: "${error.message}".`)
      return null
    }


    if (data) {
      Logger.info(`${LOGGER_PREFIX} invokeStoredProcedure: data ${JSON.stringify(data)}`)
      return data
    }

    Logger.error(`${LOGGER_PREFIX} invokeStoredProcedure: Did not return anything after completing.`)
    return null
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
    const { data, error } = parameters ? await SUPABASE_CLIENT.rpc(procName, parameters) : await SUPABASE_CLIENT.rpc(procName)
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
}
