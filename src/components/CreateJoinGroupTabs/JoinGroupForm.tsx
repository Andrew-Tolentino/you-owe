"use client"

import { useState } from 'react'
import { useForm } from '@mantine/form'
import { Button, Stack, TextInput, Text, Center } from '@mantine/core'

import { type Member } from '@/entities/member'
import { isString, isValidGroupPassword } from '@/api/utils/validators'
import { HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import { type JoinGroupDTO } from '@/api/dtos/JoinGroupDTO'
import { type NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { memberJoinGroupServerAction } from '@/app/actions/member-join-group-server-action'
import { createNewMemberAndJoinGroupServerAction } from '@/app/actions/create-new-member-and-join-group-server-action'

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
      <Button mt="md" type="submit" loading={isLoading} color="black">
        Join Group
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
    const dto = member ? { member_id: member.id, group_id: formData.groupId, group_password: formData.groupPassword } as JoinGroupDTO : { name: formData.memberName, group_id: formData.groupId, group_password: formData.groupPassword } as NewMemberDTO
    const serverActionResult = member ? await memberJoinGroupServerAction(dto as JoinGroupDTO) : await createNewMemberAndJoinGroupServerAction(dto as NewMemberDTO) 
    if (!serverActionResult.success) {
      const errorMessage = serverActionResult.errorMessage ? serverActionResult.errorMessage : HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      setServerErrorMessage(errorMessage)
    } else {
      form.reset()
    }
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)} style={{ marginTop: "14px" }}>
      {!member ? 
        <TextInput
          size="md"
          label="Name"
          placeholder="Your name"
          key={form.key('memberName')}
          {...form.getInputProps('memberName')}
        /> 
        : 
        null
      }

      <TextInput
        mt="sm"
        size="md"
        label="Group ID"
        placeholder="ID linked to the group"
        key={form.key('groupId')}
        {...form.getInputProps('groupId')}
      />

      <TextInput
        mt="sm"
        size="md"
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
