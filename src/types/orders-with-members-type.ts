import { Member } from '@/entities/member';
import { Order } from '@/entities/order';

/** Mapping containing an Order, Member who created it, and the Members involved. */
interface OrdersWithMembers {
  order: Order,
  creator_member: Pick<Member, "id" | "name">,
  participant_members: Pick<Member, "id" | "name">[]
}

export { type OrdersWithMembers }
