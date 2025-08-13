"use client"

import { useEffect, useState } from 'react'
import { 
  Container,
  Skeleton,
  Text,
  Code,
  CopyButton,
  Button,
  Switch,
  Card,
  Divider,
  ThemeIcon,
  Group as GroupComponent,
  Center,
  Stack
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconUser, IconCalendar, IconCrown } from '@tabler/icons-react'

import { getGroupServerAction } from '@/app/actions/get-group-server-action'
import { Group, UpdateGroupDTO } from '@/entities/group'
import { Member } from '@/entities/member'
import { updateGroupServerAction } from '@/app/actions/update-group-server-action'
import SimpleError from '@/components/SimpleError'

export interface GroupSettingsModalProps {
  /** ID of the Group the Modal is displaying information about */
  groupId: string

  /** Is viewer of Group its creator */
  isGroupCreator: boolean
}

/**
 * Renders the Modal UI used to display general information about a Group and settings that can be toggled.
 * 
 * @param {GroupSettingsModalProps} GroupSettingsModalProps
 */
export default function GroupInformationModal({ groupId, isGroupCreator }: GroupSettingsModalProps) {
  const [isInitializing, setIsInitializing] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[] | null>(null)

  const form = useForm<UpdateGroupDTO>({
    mode: 'uncontrolled'
  })

  useEffect(() => {
    const fetchGroup = async () => {
      const { success, payload, errorMessage } = await getGroupServerAction(groupId, true)
      if (!success) {
        setFetchError(errorMessage as string)
      } else {
        setGroup(payload?.group as Group)
        setMembers(payload?.members as Member[])

        // https://mantine.dev/form/values/#initialize-form
        form.initialize({ is_closed: payload?.group.is_closed as boolean })
      }

      setIsInitializing(false)
    }

    fetchGroup()
  }, [])

  /** Renders settings associated to the Group that can be toggled. Only the Group Creator can see this. */
  function RenderGroupSettings() {
    if (isGroupCreator) {
      return (
        <>
          <Text mt={12}>Settings</Text>
          <Card shadow="xs" radius="md" withBorder>
            <Card.Section p={12}>
              <form onSubmit={form.onSubmit(submitSettingChanges)}>
                <Text fw={700}>Close Group</Text>
                <Switch
                  key={form.key('is_closed')}
                  labelPosition="left"
                  label="Prevent new members from joining"
                  {...form.getInputProps('is_closed', { type: 'checkbox' })}
                />

                <Stack align="center" gap="xs" mt={12}>
                  <Text c="red" ta="center" size="sm">{updateError}</Text>
                  <Button type="submit" loading={form.submitting} disabled={form.submitting || !form.isDirty()}>SAVE</Button>
                </Stack>
              </form>
            </Card.Section>
          </Card>
        </>
      )
    }
  }

  /** Submits Group setting changes made by the Group creator */
  async function submitSettingChanges() {
    const formValues = form.getValues()
    const result = await updateGroupServerAction(groupId, formValues)

    if (!result.success) {
      setUpdateError(result.errorMessage as string)
      return
    }

    const group = result.payload as Group
    setGroup(group)
    form.setInitialValues({ is_closed: group.is_closed })
    form.reset()
  }

  if (isInitializing) {
    return (
      <>
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
      </>
    )
  }

  // TODO: Maybe make a cleaner error UI in the future
  if (fetchError) {
    return (
      <SimpleError 
        title="500"
        message={fetchError}
      />
    )
  }

  const groupCreatedAtDate = new Date(group?.created_at as Date)
  const groupCreatorMember = members?.find((member) => member.id === group?.creator_member_id)
  const groupUrl = `${window.location.origin}/groups/${group?.id}`
  return (
    <Container>
      <Text>Info</Text>
      <Card shadow="xs" radius="md" withBorder>
        <Card.Section p={12}>
          <GroupComponent>
            <ThemeIcon variant="white" color="black">
              <IconCalendar />
            </ThemeIcon>
          
            <Text>Created at: {groupCreatedAtDate.getDate()}/{groupCreatedAtDate.getMonth()}/{groupCreatedAtDate.getFullYear()}</Text>
          </GroupComponent>

          <Divider my={4} />

          <GroupComponent>
            <ThemeIcon variant="white" color="black">
              <IconUser />
            </ThemeIcon>

            <Text>Created by: {groupCreatorMember?.name}</Text>
          </GroupComponent>
          
        </Card.Section>
      </Card>

      {/* TODO: In the future we want to include the color associated to the Member */}
      <Text mt={12}>Members</Text>
      <Card shadow="xs" radius="md" withBorder>
        <Card.Section p={12}>
          {members?.map((member, index) => {
            if (index === 0) {
              return (
                <div key={`${group?.id}_${member.name}_${index}`}>
                  <GroupComponent key={`${group?.id}_${member.name}_${index}`}>
                    <ThemeIcon variant="filled" color="cyan" radius={22}>
                      {member.id === group?.creator_member_id ? <IconCrown /> : <IconUser />}
                    </ThemeIcon>

                    <Text>{member.name}</Text>
                  </GroupComponent>

                  <Divider my={7} />
                </div>
              )
            }

            if (index === members.length - 1) {
              return (
                <div key={`${group?.id}_${member.name}_${index}`}>
                  <GroupComponent>
                    <ThemeIcon variant="filled" color="cyan" radius={22}>
                      {member.id === group?.creator_member_id ? <IconCrown /> : <IconUser />}
                    </ThemeIcon>

                    <Text>{member.name}</Text>
                  </GroupComponent>
                </div>               
              )
            }

            return (
              <div key={`${group?.id}_${member.name}_${index}`}>
                <GroupComponent key={`${group?.id}_${member.name}_${index}`} mt={4}>
                  <ThemeIcon variant="filled" color="cyan" radius={22}>
                    {member.id === group?.creator_member_id ? <IconCrown /> : <IconUser />}
                  </ThemeIcon>

                  <Text>{member.name}</Text>
                </GroupComponent>

                <Divider my={7} />
              </div>
            )}
          )}
        </Card.Section>
      </Card>

      <Text mt={12}>Link - Send this to your friend to join!</Text>
      <Card shadow="xs" radius="md" withBorder>
        <Card.Section p={12}>
          <Code block>{groupUrl}</Code>

          {/* Note: This Copy button only works in either localhost (non-HTTPS) or HTTPS servers */}
          <Center mt={12}>
            <CopyButton value={groupUrl}>
              {({ copied, copy }) => (
                <Button color={copied ? 'teal' : 'blue'} onClick={copy}>
                  {copied ? 'COPIED' : 'COPY'}
                </Button>
              )}
            </CopyButton>
          </Center>
        </Card.Section>
      </Card>

      {isGroupCreator && RenderGroupSettings()}
    </Container>
  )
}
