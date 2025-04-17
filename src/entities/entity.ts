/**
 * Abstract entity that can be inherit to represent entities/tables within the database.
 */
interface YouOweEntity {
  /**
   * Every entity will have an unique BSON ID.
   */
  readonly id: string
}

export type { YouOweEntity }
