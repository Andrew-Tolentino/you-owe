"use client"
import { useDisclosure } from '@mantine/hooks'
import { IconMenu } from '@tabler/icons-react'

import { Group, Title, ActionIcon, Modal } from '@mantine/core'
import GroupInformationModal from '@/app/groups/[id]/components/GroupInformationModal'

export interface GroupNavigationBarProps {
  /** Name of the Group the page is on */
  groupName: string

  /** ID of the Group */
  groupId: string

  /** Is viewer of Group its creator */
  isGroupCreator: boolean
}

/**
 * Renders the Navigation Bar in the Groups Page when showing a single Group.
 * 
 * @param {GroupNavigationBarProps} GroupNavigationBarProps
 */
export default function GroupNavigationBar({ groupName, groupId, isGroupCreator } : GroupNavigationBarProps) {
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <Group justify="space-between" p="sm">
      <Title>{groupName}</Title>
      <ActionIcon
        aria-label="Settings"
        variant="white"
        color="black"
        onClick={open}
      >
        <IconMenu  />
      </ActionIcon>
      </Group>
      <Modal
        title={groupName}
        opened={opened}
        onClose={close}
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        <GroupInformationModal groupId={groupId} isGroupCreator={isGroupCreator} />
      </Modal>
    </>
  )
}
