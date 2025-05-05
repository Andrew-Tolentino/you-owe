"use client"

import { useRouter } from 'next/navigation'
import { Card, Group, Text, Badge, SimpleGrid, Button, Center } from '@mantine/core'

import { type Group as GroupEntity } from '@/entities/group'

interface DisplayGroupsProps {
  /**
   * List of Group entities.
   */
  groups: GroupEntity[]
}

export default function DisplayGroupsGrid({ groups }: DisplayGroupsProps) {
  const router = useRouter()

  /** Groups sorted by "created_at" date from most recent to oldest */
  const sortedGroupsByDate = [...groups].sort((a, b) => {
    const timeStampA = new Date(a.created_at).getTime()
    const timeStampB = new Date(b.created_at).getTime()

    if (timeStampA < timeStampB) {
      return 1 
    } else if (timeStampA > timeStampB) {
      return -1
    }

    return 0
  })

  function GroupCards() {
    return sortedGroupsByDate.map((group, index) => {
      const dateCreated = new Date(group.created_at)
      return (
        <Card 
          shadow="sm"
          radius="md"
          withBorder
          key={`${group.name}_${index}`}
        >
          <Group justify="space-between" mt="xs" mb="xs">
            <Text fw={500}>{group.name}</Text>
            {group.deleted_at === null ?
              <Badge color="green">Active</Badge>
                :
              <Badge color="red">Closed</Badge>
            }       
          </Group>
  
          <Text size="sm" c="dimmed">Created at {`${dateCreated.getDate()}/${dateCreated.getMonth()}/${dateCreated.getFullYear()}`}</Text>

          <Center>
            {/** TODO: Need to update this to use a <Link> tag instead, does not need ot be a button */}
            <Button
              color="blue"
              mt="md"
              radius="lg"
              w="80%"
              onClick={() => router.push(`/groups/${group.id}`)}
            >
              View Group
            </Button>
          </Center>
        </Card>       
      )
    })
  }

  return (
    <SimpleGrid cols={1}>
      <GroupCards />
    </SimpleGrid>
  )
}
