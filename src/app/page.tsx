import { 
  Container,Tabs,TabsList,
  TabsTab,TabsPanel,Title, 
  Divider,Text,Timeline,
  TimelineItem
} from '@mantine/core'

import { IconNumber1, IconNumber2, IconNumber3 } from '@tabler/icons-react'

import CreateGroupForm from '@/components/CreateGroupForm'
import { Members } from '@/models/Members'
import { Member } from '@/entities/member'
import { Group } from '@/entities/group'
import DisplayGroupsGrid from '@/components/DisplayGroupsGrid'
import JoinGroupForm from '@/components/JoinGroupForm'
import { Users } from '@/models/Users'
import { WebError } from '@/utils/errors'
import Logger from '@/utils/logger'

const LOGGER_PREFIX = '[app/page]'

export default async function Page() {
  const users = new Users()
  const userId = await users.getAuthUserId()

  let member: Member | null = null
  let groups: Group[] = []

  if (userId) {
    const members = new Members()
    // Fetch Member
    member = await members.fetchMemberByAuthUserId(userId)

    // Member should not be null if they have a user ID
    if (member === null) {
      Logger.error(`${LOGGER_PREFIX} Page: User with ID "${userId}" was found not linked to any Member.`)
      // Intentionally throwing this error to hit an Error Boundary to show users.
      // This should not happen, all Users must be associated to a Member
      throw new WebError()
    }

    // Fetch Groups linked to Member
    groups = await members.fetchGroupsLinkedToMember(member.id) ?? []
  }


  // If so, present them with a form to create a group that doesn't ask for their name.
  return (
    // TODO: Going to need to make the <Container> Responsive for mobile use - https://mantine.dev/core/container/#responsive-max-width
    <Container>
      <Title order={1} style={{ textAlign: "center" }}>You Owe</Title>
      <Title order={4} style={{ textAlign: "center" }}>Split the bill. Keep it chill.</Title>
      <Divider my={"md"} />

      {member ?
        <Title order={3} mb="sm" style={{ textAlign: "center" }}>Welcome, {member.name}</Title>
        :
        null
      }

      <Container>
        <Tabs color="black" defaultValue="create-group">
          <TabsList justify="center">
            <TabsTab value="create-group">
              Create a Group
            </TabsTab>
            <TabsTab value="join-group">
              Join a Group
            </TabsTab>          
          </TabsList>

          <TabsPanel value="create-group">
            <CreateGroupForm member={member} />
          </TabsPanel>
          <TabsPanel value="join-group">
            <JoinGroupForm member={member}/>
          </TabsPanel>
        </Tabs>             
      </Container>

      <Container mt="md">
        <DisplayGroupsGrid groups={groups} />
      </Container>

      <Container mt="md">
        <Title order={2} mb="sm">How it works</Title>
        <Timeline bulletSize={30} lineWidth={3} active={3} color="black">
          <TimelineItem
            bullet={ <IconNumber1 size={14} /> }
            title="Create a Group"
            lineVariant="dashed"
          >
            <Text c="dimmed" size="sm">Name your outing</Text>
          </TimelineItem>

          <TimelineItem
            bullet={ <IconNumber2 size={14} /> }
            title="Invite your friends"
            lineVariant="dashed"
          >
            <Text c="dimmed" size="sm">Share the invitation link or give your friends the Group ID</Text>
          </TimelineItem>

          <TimelineItem
            bullet={ <IconNumber3 size={14} /> }
            title="Add your orders"
            lineVariant="dashed"
          >
            <Text c="dimmed" size="sm">The app will do the rest</Text>
          </TimelineItem>
        </Timeline>
      </Container>

    </Container>
  )
}
