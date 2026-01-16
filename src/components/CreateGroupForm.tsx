"use client"

import { useState } from 'react'
import { TextInput, Center } from '@mantine/core'
import { useForm } from '@mantine/form'

import { isString, isValidGroupPassword } from '@/api/utils/validators'
import { createNewMemberAndGroupServerAction } from '@/app/actions/create-new-member-and-group-server-action'
import { createNewGroupServerAction } from '@/app/actions/create-new-group-server-action'
import { NewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { NewGroupDTO } from '@/api/dtos/NewGroupDTO'
import { HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'
import { Member } from '@/entities/member'
import SubmitButton from '@/components/SubmitButton'

interface CreateGroupFormProps {
  /**
   * Member entity populated if an authenticated user is viewing the <CreateGroupForm />.
   */
  member?: Member | null
}

export default function CreateGroupForm({ member }: CreateGroupFormProps) {
  const [serverErrorMessage, setServerErrorMessage] = useState<string>('')

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      memberName: '',
      groupName: '',
      groupPassword: ''
    },
    validate: {
      memberName: validateMemberNameField,
      groupName: validateGroupNameField,
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

  function validateGroupNameField(val: string): string | null {
    if (!isString(val)) {
      return "Invalid 'Group Name'."
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
    
    const newMemberDTO: NewMemberDTO = { name: formData.memberName }
    const newGroupDTO: NewGroupDTO = { name: formData.groupName, password: formData.groupPassword }
    const serverActionResult = member ? await createNewGroupServerAction({ ...newGroupDTO, creator_member_id: member.id }) : await createNewMemberAndGroupServerAction(newMemberDTO, newGroupDTO)

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
        label="Group Name"
        placeholder="Bar Louis's Night Out"
        key={form.key('groupName')}
        {...form.getInputProps('groupName')}
      />

      <TextInput
        mt="sm"
        size="md"
        label="Group Password"
        placeholder="Optional password to join"
        key={form.key('groupPassword')}
        {...form.getInputProps('groupPassword')}
      />

      <Center>
        <SubmitButton isLoading={form.submitting} errorMessage={serverErrorMessage}>
          Submit
        </SubmitButton>
      </Center>
    </form>
  )
}
