import { type YouOweEntity } from '@/entities/entity'

/** Base Interface that will be used throughout the application to hide implementation details per DB client provider. */
interface DBClient {
  getEntityById(tableName: string, id: string): Promise<YouOweEntity | null>
  getEntityByAuthUserId(tableName: string, authUserId: string): Promise<YouOweEntity | null>
  createEntity(tableName: string, entity: Partial<YouOweEntity>): Promise<YouOweEntity | null>
  deleteEntityById(tableName: string, id: string): Promise<boolean>
  invokeStoredProcedure(procName: string, parameters?: object): Promise<unknown | null>
  invokeStoredProcedureVoid(procName: string, parameters?: object): Promise<boolean>
}

export { type DBClient }
