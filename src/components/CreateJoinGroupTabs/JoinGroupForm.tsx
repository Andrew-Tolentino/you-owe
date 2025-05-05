"use client"

import { useState } from 'react'
import { useForm } from '@mantine/form'
import { Button, Stack, TextInput, Text, Center } from '@mantine/core'

import { type Member } from '@/entities/member'
import { isString, isValidGroupPassword } from '@/api/utils/validators'
import { HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import { type JoinGroupDTO } from '@/api/dtos/JoinGroupDTO'
import { type NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { memberJoinGroupAction } from '@/actions/member-join-group-action'

interface SubmitButtonProps {
  /**
   * Decides whether the button should show a loading spinner.
   */
  isLoading: boolean

  /**
   * Displays an error message.
   */
  errorMessage: string
}

function SubmitButton({ isLoading, errorMessage='' }: SubmitButtonProps) {
  return (
    <Stack gap="xs">
      <Button mt="md" type="submit" loading={isLoading}>
        Create Group
      </Button>
      <Text c="red">{errorMessage}</Text>
    </Stack>
  )
}

interface JoinGroupFormProps {
  /**
   * Member entity populated if an authenticated user is viewing the <CreateGroupForm />.
   */
  member?: Member | null
}

export default function JoinGroupForm({ member }: JoinGroupFormProps) {
  const [serverErrorMessage, setServerErrorMessage] = useState('')
  
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      memberName: '',
      groupId: '',
      groupPassword: ''
    },
    validate: {
      memberName: validateMemberNameField,
      groupId: validateGroupIdField,
      groupPassword: validateGroupPasswordField
    }
  })

  function validateMemberNameField(val: string): string | null {
    // If there is a Member loaded in, then this field is optional.
    // Since there will be no need to create a new Member entity.
    if (!member && !isString(val)) {
      return "Invalid 'Name'."
    }

    return null
  }

  function validateGroupIdField(val: string): string | null {
    if (!isString(val)) {
      return "Invalid 'Group Id'."
    }

    return null
  }

  function validateGroupPasswordField(val: string): string | null {
    const password = val.trim()
    if (password) {
      const errorMessage = isValidGroupPassword(val)
      if (errorMessage) return `${errorMessage}`
    }

    return null
  }

  async function onSubmit(formData: typeof form.values) {
    setServerErrorMessage('')
    
    if (member) {
      const joinGroupDTO: JoinGroupDTO = { member_id: member.id, group_id: formData.groupId, group_password: formData.groupPassword }
      const serverActionResult = await memberJoinGroupAction(joinGroupDTO)
      if (!serverActionResult?.success) {
        const errorMessage = serverActionResult.errorMessage ? serverActionResult.errorMessage : HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        setServerErrorMessage(errorMessage)
      }
    } else {
      const newMemberDTO: NewMemberDTO = { name: formData.memberName, group_id: formData.groupId, group_password: formData.groupPassword }
      // TODO: Call server action and then if needed set server error

    }
    const newMemberDTO: NewMemberDTO = { name: formData.memberName }
    const newGroupDTO: NewGroupDTO = { name: formData.groupName, password: formData.groupPassword }
    const serverActionResult = member ? await createNewGroupServerAction({ ...newGroupDTO, creator_member_id: member.id }) : await createNewMemberAndGroupServerAction(newMemberDTO, newGroupDTO)

    if (!serverActionResult.success) {
      const errorMessage = serverActionResult.errorMessage ? serverActionResult.errorMessage : HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      setServerErrorMessage(errorMessage)
    }
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      {!member ? 
        <TextInput
          label="Name"
          placeholder="Your name"
          key={form.key('memberName')}
          {...form.getInputProps('memberName')}
        /> 
        : 
        <h2>{member.name}</h2>
      }

      <TextInput
        label="Group ID"
        placeholder="ID linked to the group"
        key={form.key('groupId')}
        {...form.getInputProps('groupId')}
      />

      <TextInput
        label="Group Password"
        placeholder="Required if the group has one"
        key={form.key('groupPassword')}
        {...form.getInputProps('groupPassword')}
      />

      <Center>
        <SubmitButton isLoading={form.submitting} errorMessage={serverErrorMessage} />
      </Center>
    </form>
  )
}
