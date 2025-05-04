import { DBClient } from '@/db/db-client'
import { SupabaseDBClient } from '@/db/supabase-client'
import { type Group, TABLE_NAME as GroupsTable } from '@/entities/groups'

/** Model representing the Group entity that can be used for business logic related to Groups. */
export class Groups {
  private _dbClient: DBClient

  constructor() {
    this._dbClient = new SupabaseDBClient()
  }

  /**
   * Creates a Group. There is already a DB trigger to add into the "members_groups" join table the new Group and Member.
   * 
   * @param {Partial<Group>} { name, password, creator_member_id } fields are required from a Group
   * @returns {Promise<Group | null>}
   */
  async createGroup({ name, password, creator_member_id }: Partial<Group>): Promise<Group | null> {
    const newGroup = await this._dbClient.createEntity(GroupsTable, { name, password, creator_member_id } as Partial<Group>)
    if (newGroup !== null) {
      // Redacting password
      return { ...newGroup, password: null } as Group
    }

    return newGroup
  }
}
