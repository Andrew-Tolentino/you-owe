import { FilterOperator, type DBClient, type DBFilterMap } from '@/db/db-client'
import { PROC_CREATE_NEW_MEMBER_AND_LINK_TO_MEMBERS_GROUPS, ProcCreateNewMemberAndLinkToMemberGroupsParameters } from '@/db/stored-procedures'
import { SupabaseDBClient } from '@/db/supabase-client'
import { Group, TABLE_NAME as GroupsTable } from '@/entities/group'
import { Member, TABLE_NAME as MembersTable } from '@/entities/member'
import {  MemberGroup, TABLE_NAME as MembersGroupsJoinTable } from '@/entities/member-group'

/** Model representing the Member entity that can be use for business logic related to Members. */
export class Members {
  private _dbClient: DBClient

  constructor() {
    this._dbClient = new SupabaseDBClient()
  }

  /**
   * Creates a new Member and links the Member to a specified Group.
   * 
   * @param {string} memberName - Name of Member
   * @param {string} groupId - ID of Group the newly created Member will join
   * @param {string} authUserId - Authentication ID of the User linked to the Member
   * 
   * @returns {Member} Newly created Member
   */
  async createMember(memberName: string, groupId: string, authUserId: string ): Promise<Member | null> {
    const procParams: ProcCreateNewMemberAndLinkToMemberGroupsParameters = {
      member_name: memberName,
      group_id: groupId,
      auth_user_id: authUserId
    } 

    const storedProcResults = await this._dbClient.invokeStoredProcedure<Member>(PROC_CREATE_NEW_MEMBER_AND_LINK_TO_MEMBERS_GROUPS, procParams)
    if (!storedProcResults.success) {
      return null
    }

    return storedProcResults.payload as Member
  }

  /**
   * Fetches a Member given its associated User Authentication ID.
   * 
   * @param {string} authUserId
   * 
   * @returns {Promise<Member | null>} Returns Member if found, else null
   */
  async fetchMemberByAuthUserId(authUserId: string): Promise<Member | null> {
    const members: Member[] | null =  await this._dbClient.getEntityByAuthUserId(MembersTable, authUserId) as Member[]

    if (members === null) {
      return null
    }

    if (members.length === 0) {
      return null
    }

    return members[0] as Member
  }

  /**
   * Fetches a Member given its ID.
   * 
   * @param {string} id
   * 
   * @returns {Promise<Member | null>} Returns Member if found, else null
   */
  async fetchMemberById(id: string): Promise<Member | null> {
    const members: Member[] | null =  await this._dbClient.getEntityById(MembersTable, id) as Member[]

    if (members === null) {
      return null
    }

    if (members.length === 0) {
      return null
    }

    return members[0] as Member
  }

  /**
   * Fetches all Groups linked to a Member (that they created or are a part of).
   * 
   * @param {string} id
   * 
   * @returns {Promise<Group[] | null>} Returns an array of Groups, or null if an error occured
   */
  async fetchGroupsLinkedToMember(id: string): Promise<Group[] | null> {
    const dbFilter: DBFilterMap[] = [ { column: 'id', value: id, operator: FilterOperator.EQUALS }]
    const groups = await this._dbClient.getOneToManyEntities<Group>(MembersTable, GroupsTable, MembersGroupsJoinTable, dbFilter) 
    
    if (groups === null) { 
      return null
    }

    // Redact passwords
    const sanitizedGroups = groups.map((group: Group) => {
      return { ...group, password: null }
    })

    return sanitizedGroups
  }

  /**
   * Checks if a Member belongs to a Group regardless if the Member/Group is active.
   * 
   * @param {string} memberId - ID of the Member
   * @param {string} groupId - ID of the Group
   * 
   * @returns {Promise<boolean>} Returns true if the Member belongs to the Group, else false
   */
  async isMemberInGroup(memberId: string, groupId: string): Promise<boolean> {
    const dbFilters: DBFilterMap[] = [
      {
        column: 'member_id',
        value: memberId,
        operator: FilterOperator.EQUALS
      },
      {
        column: 'group_id',
        value: groupId,
        operator: FilterOperator.EQUALS
      }
    ] 
    const membersGroups: MemberGroup[] | null = await this._dbClient.getEntityByDBFilters(MembersGroupsJoinTable, dbFilters) as MemberGroup[]
    
    if (membersGroups === null) {
      return false
    }

    if (membersGroups.length === 0) {
      return false
    }

    return true
  }
}
