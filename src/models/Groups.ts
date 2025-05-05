import { DBClient } from '@/db/db-client'
import { SupabaseDBClient } from '@/db/supabase-client'
import { type Group, TABLE_NAME as GroupsTable } from '@/entities/group'
import { TABLE_NAME as MembersGroupsJoinTable, MemberGroup } from '@/entities/member-group'

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

  /**
   * Fetches a Group given its ID.
   * 
   * @param {string} id - ID belonging to Group
   * @param {boolean} redactPassword - true by default, nullifies password with Group object when true
   * @returns {Promise<Group | null>} Returns Group if found, else null
   */
  async fetchGroup(id: string, redactPassword: boolean = true): Promise<Group | null> {
    const groups: Group[] | null = await this._dbClient.getEntityById(GroupsTable, id) as Group[]

    if (groups === null) {
      return null
    }

    if (groups.length === 0) {
      return null
    }

    if (redactPassword) {
      // Redacting password
      return { ...groups[0], password: null }
    }
    
    return groups[0]
  }

  /**
   * Links a Member to a Group via the join table.
   * 
   * @param {string} memberId - The ID of the Member to link
   * @param {string} id - ID of the Group the Member will join 
   * @returns {Promise<boolean>} Returns true if the Member is able to link to the Group, else false
   */
  async linkMemberToGroup(memberId: string, id: string): Promise<boolean> {
    const memberGroup: Partial<MemberGroup> = { member_id: memberId, group_id: id }
    const success = await this._dbClient.createEntity(MembersGroupsJoinTable, memberGroup)
    return success !== null
  }
}
