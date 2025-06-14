"use client"

import { useRouter } from 'next/navigation'

import JoinGroupForm from '@/components/JoinGroupForm'
import { type Member } from '@/entities/member'

interface UserOrNonUserJoinGroupFormProps {
  /**
   * If provided, means that an existing User is trying to join the Group.
   */
  member?: Member

  /**
   * ID of the Group someone is trying to join.
   */
  groupId: string
}

/**
 * Renders the UI for someone trying to join a Group that is an existing User or non-existing User.
 * 
 * @param {UserOrNonUserJoinGroupFormProps} UserOrNonUserJoinGroupFormProps
 */
export default function UserOrNonUserJoinGroupForm({ member, groupId }: UserOrNonUserJoinGroupFormProps) {
  const router = useRouter()
  /**
   * After successfully linking User to the Group, refresh the page again.
   */
  function onSubmit() {
    router.refresh()
  }

  return (
    <JoinGroupForm
      member={member}
      groupId={groupId}
      onSubmit={onSubmit}
    />
  )
}
