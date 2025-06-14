import { FilterOperator, type DBClient, type DBFilterMap } from '@/db/db-client'
import { PROC_CREATE_NEW_MEMBER_AND_LINK_TO_MEMBERS_GROUPS, ProcCreateNewMemberAndLinkToMemberGroupsParameters } from '@/db/stored-procedures'
import { SupabaseDBClient } from '@/db/supabase-client'
import { type Group, TABLE_NAME as GroupsTable } from '@/entities/group'
import { type Member, TABLE_NAME as MembersTable } from '@/entities/member'
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
   * Fetches a Member and the Groups the Member is linked to.
   * 
   * @param {string} authUserId - Auth User ID of the Member
   * 
   * @returns {Promise<{ member: Member, groups: Group[] } | null>} The Member and the Groups its associated to, returns null if nothing found
   */
  async fetchMemberAndGroups(authUserId: string): Promise<{ member: Member, groups: Group[] } | null> {
    const dbFilter: DBFilterMap[] = [ { column: 'auth_user_id', value: authUserId, operator: FilterOperator.EQUALS }]
    const membersAndGroups = await this._dbClient.getOneToManyEntities<Member, Group>(MembersTable, GroupsTable, MembersGroupsJoinTable, dbFilter) 
    if (membersAndGroups === null) { 
      return null
    }

    // "rawMember" has all the fields of a Member entity plus some other things, so will only return Member related fields
    const rawMember = membersAndGroups[MembersTable] as Member
    const member: Member = {
      id: rawMember.id,
      name: rawMember.name,
      created_at: rawMember.created_at,
      updated_at: rawMember.updated_at,
      deleted_at: rawMember.deleted_at,
      auth_user_id: authUserId
    }
    const rawGroup = membersAndGroups[GroupsTable] as Group[]

    return {
      member,
      groups: rawGroup.map((val) => ({ ...val, password: null })) // Redact password
    }
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
