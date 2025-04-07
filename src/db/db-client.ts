import { YouOweEntity } from '@/entities/entity'

/** Base Interface that will be used throughout the application to hide implementation details per DB client provider. */
export interface DBClient {
  getEntityById(tableName: string, id: string): Promise<YouOweEntity | null>
  createEntityById(tableName: string, entity: YouOweEntity): Promise<YouOweEntity | null>
  deleteEntityById(tableName: string, id: string): Promise<boolean>
}
