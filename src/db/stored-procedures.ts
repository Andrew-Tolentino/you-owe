// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type Member } from '@/entities/member'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {type  Order } from '@/entities/order'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type OrdersWithMembers } from '@/types/orders-with-members-type'

/**
 * Creates a new Member and then a new Group with that Member as the Group's creator.
 * The purpose of this stored procedure is for new users to create a Group (which by doing so will create a Member too).
 * 
 * @param {ProcCreateNewMemberAndGroup} ProcCreateNewMemberAndGroup
 * @returns {ProcCreateNewMemberAndGroupQuery[]} ProcCreateNewMemberAndGroupQuery[]
 */
const PROC_CREATE_NEW_MEMBER_AND_GROUP = 'create_new_member_and_group'

/** PROC_CREATE_NEW_MEMBER_AND_GROUP - Parameters */
interface ProcCreateNewMemberAndGroupParameters {
  /**
   * The name of the new Member the user will associated to.
   */
  new_member_name: string

  /**
   * The name for the Group the user will create.
   */
  new_group_name: string

  /**
   * Optional - The password the user wishes to set for the Group.
   * 
   */
  new_group_password: string | null

  /**
   * The Supabase auth_id associated to the user.
   */
  auth_user_id: string
}

/** PROC_CREATE_NEW_MEMBER_AND_GROUP - Returning query mapping */
interface ProcCreateNewMemberAndGroupQuery {
  /**
   * ID of the newly created Member.
   */
  member_id: string

  /**
   * Name of the newly created Member.
   */
  member_name: string

  /**
   * Date the Member was created.
   */
  member_created_at: Date

  /**
   * ID of the newly created Group.
   */
  group_id: string

  /**
   * Name of the newly created Group.
   */
  group_name: string

  /**
   * Date the Group was created.
   */
  group_created_at: Date
}
export { PROC_CREATE_NEW_MEMBER_AND_GROUP, type ProcCreateNewMemberAndGroupParameters, type ProcCreateNewMemberAndGroupQuery }

/**
 * Creates a new Member and then links them to an existing Group.
 * 
 * @param {ProcCreateNewMemberAndLinkToMemberGroupsParameters} ProcCreateNewMemberAndLinkToMemberGroups
 * @returns {Members[]} Members[]
 */
const PROC_CREATE_NEW_MEMBER_AND_LINK_TO_MEMBERS_GROUPS = 'create_new_member_and_link_to_members_groups'

/** PROC_CREATE_NEW_MEMBER_AND_LINK_TO_MEMBERS_GROUPS - Parameters */
interface ProcCreateNewMemberAndLinkToMemberGroupsParameters {
  /**
   * The name of the new Member the user will associated to.
   */
  member_name: string

  /**
   * The ID of the existing Group the new Member will Join
   */
  group_id: string

  /**
   * The Supabase auth_id associated to the user.
   */
  auth_user_id: string
}
export { PROC_CREATE_NEW_MEMBER_AND_LINK_TO_MEMBERS_GROUPS, type ProcCreateNewMemberAndLinkToMemberGroupsParameters }

/**
 * Creates a new Order for a Member within a Group.
 * 
 * Does the following checks:
 *  1. Check if Member is active
 *  2. Check if Group is active and Member belongs in Group
 *  3. Check if participant Members are active and belong in Group
 * 
 * After successfully creating an Order, broadcasts a message in the following way...
 *  - Topic: "orders_groups-<group_id>"
 *  - Event: ORDER_CREATED
 *  - Payload: OrdersWithMembers
 * 
 * @param {ProcCreateNewOrderParameters} ProcCreateNewOrderParameters
 * @returns {Order} Order
 */
const PROC_CREATE_NEW_ORDER = 'create_new_order'

/** PROC_CREATE_NEW_ORDER - Parameters */
interface ProcCreateNewOrderParameters {
  /**
   * ID belonging to the Member who is creating the Order.
   */
  creator_member_id: string

  /**
   * ID belonging to the Group the Member is creating the Order for.
   */
  target_group_id: string

  /**
   * Name of the Order.
   */
  target_title: string

  /**
   * Optional
   * 
   * Note for the Order.
   */
  target_description: string | null

  /**
   * The cost of the Order.
   */  
  target_price: number

  /**
   * Optional
   * 
   * List Member IDs who are going to split the cost of the Order.
   */  
  target_participant_member_ids: string[] | null
}
export { PROC_CREATE_NEW_ORDER, type ProcCreateNewOrderParameters }

/**
 * Retreives Orders, in descending order based on creation, with query filters.
 * 
 * @param {ProcGetOrdersParameters} ProcGetOrdersParameters - mapping of query filters that can be applied.
 * @returns {OrdersWithMembers[]} List of OrderWithMembers
 */
const PROC_GET_ORDERS = 'get_orders'

/** PROC_GET_ORDERS - Parameters */
interface ProcGetOrdersParameters {
  /**
   * Filter to grab Orders within a specific Group.
   */
  target_group_id: string | null

  /**
   * Filter to grab Orders created by specific Member.
   */
  target_creator_member_id: string | null
}
export { PROC_GET_ORDERS, type ProcGetOrdersParameters }
