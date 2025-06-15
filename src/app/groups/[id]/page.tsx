import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Text } from '@mantine/core'

import DisplayOrdersGrid from '@/components/DisplayOrdersGrid'
import UserOrNonUserJoinGroupForm from '@/app/groups/[id]/components/UserOrNonUserJoinGroupForm'
import { Groups } from '@/models/Groups'
import { Members } from '@/models/Members'
import { Users } from '@/models/Users'
import Logger from '@/utils/logger'
import { WebError } from '@/utils/errors'
import SimpleError from '@/components/SimpleError'

const LOGGER_PREFIX = '[app/groups/[id]/page]'

/**
 * Renders UI when a User is trying to join a Group marked as closed.
 * Groups flagged as closed means that no new Members can join.
 */
function RenderGroupIsClosed() {
  return (
    <SimpleError 
      title="400"
      message="This Group is marked as 'closed' which means that no new Members can join"
      content={
        <Link href="/">
          <Text size="sm" c="blue">Go Home</Text>
        </Link>
      }
    />
  )
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  // Check if Group is valid
  const { id } = await params
  
  const groups = new Groups()
  const group = await groups.fetchGroup(id)

  // Group does not exist
  if (group === null) {
    notFound()
  }

  // Check if there is a user in session
  const users = new Users()
  const userId = await users.getAuthUserId()

  // User is not found within request
  if (userId === null) {
    // Person cannot join the Group since it is marked as closed
    if (group.is_closed) {
      return <RenderGroupIsClosed />
    }
    
    // Display form to allow person to create a User and then join Group
    return <UserOrNonUserJoinGroupForm groupId={id} />
  }

  // Check if User is in Group already
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
      return <RenderGroupIsClosed />
    }

    return <UserOrNonUserJoinGroupForm member={member} groupId={id} />
  }

  return (
    <DisplayOrdersGrid groupId={id} />
  )
}
