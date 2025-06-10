import { type YouOweEntity } from '@/entities/entity'
import { type StoredProcedureResults } from '@/types/promise-results-types'

/** Base Interface that will be used throughout the application to hide implementation details per DB client provider. */
interface DBClient {
  getEntityById(tableName: string, id: string): Promise<YouOweEntity[] | null>
  getEntityByAuthUserId(tableName: string, authUserId: string): Promise<YouOweEntity[] | null>
  getEntityByDBFilters(tableName: string, dbFilters: DBFilterMap[]): Promise<YouOweEntity[] | null>
  createEntity(tableName: string, entity: Partial<YouOweEntity>): Promise<YouOweEntity | null>
  updateEntityById(tableName: string, id: string, entity: Partial<YouOweEntity>): Promise<YouOweEntity | null>
  deleteEntityById(tableName: string, id: string): Promise<boolean>
  invokeStoredProcedure<T>(procName: string, parameters?: object): Promise<StoredProcedureResults<T>>
  invokeStoredProcedureVoid(procName: string, parameters?: object): Promise<boolean>
  getOneToManyEntities<T extends YouOweEntity, U extends YouOweEntity>(singleRelationTableName: string, manyRelationTableName: string, joinTableName: string, dbFilters: DBFilterMap[]): Promise<{ [key: string]: T | U[]} | null>
}

/** Mapping used to help apply filters to DB queries */
interface DBFilterMap {
  column: string
  value: unknown
  operator: FilterOperator
}

/** ENUM that can be use to identify what kind of DB filter is being used to make a query */
enum FilterOperator {
  EQUALS
}

export { type DBClient, type DBFilterMap, FilterOperator }
