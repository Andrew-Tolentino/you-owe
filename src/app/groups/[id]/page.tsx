import { notFound, redirect } from 'next/navigation'

import DisplayOrdersGrid from '@/components/DisplayOrdersGrid'
import { Groups } from '@/models/Groups'
import { Members } from '@/models/Members'
import { Users } from '@/models/Users'
import Logger from '@/utils/logger'
import { WebError } from '@/utils/errors'

const LOGGER_PREFIX = '[app/groups/[id]/page]'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  // Check if there is a user in session
  const users = new Users()
  const userId = await users.getAuthUserId()

  // User is not found within request, redirect to Home
  if (userId === null) {
    // Redirect to Home
    redirect('/')
  }

  // Check if Group is valid
  const { id } = await params
  const groups = new Groups()
  const group = await groups.fetchGroup(id)

  // Group does not exist
  if (group === null) {
    notFound()
  }

  // Check if User is in Group
  const members = new Members()
  const member = await members.fetchMemberByAuthUserId(userId as string)
  if (member === null) {
    Logger.error(`${LOGGER_PREFIX} Page: User with ID "${userId}" was found not linked to any Member.`)
    // Intentionally throwing this error to hit an Error Boundary to show users.
    // This should not happen, all Users must be associated to a Member
    throw new WebError()
    
  }
  const isMemberInGroup = await members.isMemberInGroup(member?.id as string, group?.id as string)
  if (!isMemberInGroup) {
    if (group?.is_closed) {
      // TODO: Display in UI that User cannot join Group because it is closed
    }
    // TODO: Redirect User to a page that allows them to join. This can be a new page for now or a Modal if it's easy to implement.
    // TODO: Page should then refresh
  }

  /**
   * TODO:
   *  1. Detect if User is in session
   *    a. If User is not in session, redirect back to Home Page
   *  2. Load up Group based on ID
   *  3. Check if the User belongs to the Group
   *    a. If not, redirect User to a Page that links them to the Group
   *    b. If not and the Group is closed, notify User that the Group is closed
   *  3. Check if the Group is closed
   *    a. If so, notify User that it is closed and show them an uneditable page of all Orders
   *  4. If User is in Group and Group is NOT closed, then display them all orders and such
   */

  return (
    <DisplayOrdersGrid groupId={id} />
  )
}
