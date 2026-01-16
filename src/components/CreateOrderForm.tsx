"use client"

import { useEffect, useState } from 'react'
import { useForm } from '@mantine/form'
import {
  Chip, ChipGroup, Group,
  NumberInput, Textarea, TextInput,
  Text, Skeleton, ActionIcon, Flex,
  Center
} from '@mantine/core'
import { IconUsersGroup } from '@tabler/icons-react'

import { Member } from '@/entities/member'
import { getGroupServerAction } from '@/app/actions/get-group-server-action'
import SimpleError from '@/components/SimpleError'
import SubmitButton from '@/components/SubmitButton'
import { isString } from '@/api/utils/validators'
import { NewOrderDTO } from '@/api/dtos/NewOrderDTO'
import { createOrderServerAction } from '@/app/actions/create-new-order-action'
import { HTTP_ERROR_MESSAGES } from '@/api/utils/HTTPStatusCodes'

/** Mapping of values needed to create an Order */
interface createOrderForm {
  /** Title of Order */
  orderTitle: string

  /** Price of Order */
  orderPrice: number | null

  /** Description of Order */
  orderDescription: string

  /** Members associated to Order */
  orderParticipants: string[]
}

export interface CreateOrderFormProps {
  /** ID of the Member creating the Order */
  orderCreatorMemberId: string

  /** ID of the Group the Order is for */
  groupId: string

  /** Callback after an Order has successfully been created */
  onSubmitCallback: () => void
}

/**
 * Renders a form that can be use to create Orders.
 * 
 * @param {CreateOrderFormProps} CreateOrderFormProps 
 */
export default function CreateOrderForm({ orderCreatorMemberId, groupId, onSubmitCallback }: CreateOrderFormProps) {
  const [isInitializing, setIsInitializing] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [members, setMembers] = useState<Member[] | null>(null)
  const [serverErrorMessage, setServerErrorMessage] = useState<string>('')

  const form = useForm<createOrderForm>({
    mode: 'uncontrolled',
    initialValues: {
      orderTitle: '',
      orderPrice: null,
      orderDescription: '',
      orderParticipants: [orderCreatorMemberId]
    },
    validate: {
      orderTitle: validateOrderTitle,
      orderPrice: validateOrderPrice,
      orderParticipants: validateOrderParticipants
    }
  })

  // Fetch Members from Group
  useEffect(() => {
    const fetchGroupMembers = async () => {
      const { success, payload, errorMessage } = await getGroupServerAction(groupId, true)
      if (!success) {
        setFetchError(errorMessage as string)
      } else {
        setMembers(payload?.members as Member[])
      }

      setIsInitializing(false)
    }

    fetchGroupMembers()
  }, [])

  /**
   * Verifies that the title of Order is...
   *  1. Not an empty string
   *  2. Not longer than 200 characters
   * 
   * @param {string} val - Title input field value
   *  
   * @returns {string | null} Returns string representing error message or null if validation succeeded
   */
  function validateOrderTitle(val: string): string | null {
    if (!val) {
      if (!isString(val)) 
        return "Invalid 'Title'."

      if (val.length > 200) {
        return "'Title' is too long."
      }
    }
    
    return null
  }

  /**
   * Verifies the price of Order is...
   *  1. A number
   *  2. A value greater than 0
   * 
   * @param {number | null} val - Price input field value
   *  
   * @returns {string | null} Returns string representing error message or null if validation succeeded
   */
  function validateOrderPrice(val: number | null): string | null {
    if (val === null) {
      return "Invalid 'Price', please enter a number."
    }
    
    if (isNaN(val)) {
      return "Invalid 'Price', please use a number."
    }

    if (val <= 0) {
      return "Invalid 'Price', please use a number greater than 0."
    }

    return null
  }

  /**
   * Verifies that the participant list for Order is...
   *  1. Not empty
   *  2. Each element is a Member ID
   *  3. There are no duplicate values
   * 
   * @param {string[]} val - Participants (Member IDs) in Order
   *  
   * @returns {string | null} Returns string representing error message or null if validation succeeded
   */
  function validateOrderParticipants(val: string[]): string | null {
    if (val.length === 0) {
      return "Please select at least 1 'participant' for Order."
    }

    /** Use to flag Members for verifying if there are any duplicates or any Member IDs 
     *  that are not within the Group.
     */
    const memberIdAuxMap: Map<string, boolean> = new Map()
    for (const member of members as Member[]) {
      memberIdAuxMap.set(member.id, false)
    }

    for (const memberId of val) {
      if (!memberIdAuxMap.has(memberId)) {
        return "Please only select 'participants' within the Group."
      }

      if (memberIdAuxMap.get(memberId) === false) {
        // Flip to true to indicate this Member has not yet been marked in the auxillary map
        memberIdAuxMap.set(memberId, true)
      } else {
        // Member has already been marked as added but appears again within the form
        return "Please do not select duplicate 'participants' for the Order."
      }
    }

    return null
  }

  /** Renders a list of Chips for Users to select who will be associated with the Order.
   * Each Member in the Group should be available.
   */
  function RenderPartipantChips() {
    return (
      <ChipGroup
        key={form.key('orderParticipants')}
        {...form.getInputProps('orderParticipants')}
        multiple
      >
        <Group mt="md">
          {members?.map((member, index) => 
            (
              <Chip key={`${index}_${member.id}`} value={member.id} color="black">
                {member.name}
              </Chip>
            )
          )}
        </Group>
      </ChipGroup>
    )
  }

  /**
   * Adds all Members in the Group to the Order
   */
  function setEveryMemberToOrder() {
    if (members) {
      const memberIds = members.map((member) => member.id)
      form.setFieldValue('orderParticipants', memberIds)
    }
  }

  /**
   * Attempts to create a new Order based on form data. 
   * Sets the server error message displated to User if anything goes wrong.
   * 
   * @param {formData} formData 
   */
  async function onSubmit(formData: typeof form.values) {
    setServerErrorMessage('')

    const newOrderDTO: NewOrderDTO = {
      creator_member_id: orderCreatorMemberId,
      group_id: groupId,
      title: formData.orderTitle,
      description: formData.orderDescription,
      price: formData.orderPrice as number,
      participant_member_ids: formData.orderParticipants
    }
    const serverActionResult = await createOrderServerAction(newOrderDTO)

    if (!serverActionResult.success) {
      const errorMessage = serverActionResult.errorMessage ? serverActionResult.errorMessage : HTTP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      setServerErrorMessage(errorMessage)
    } else {
      form.reset()
      onSubmitCallback()
    }
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

  // Note - For <Input>'esque components set "size="md"" to prevent mobile screens from focusing
  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <TextInput 
        label="Title"
        placeholder="Appetizers"
        size="md"
        key={form.key('orderTitle')}
        {...form.getInputProps('orderTitle')}
      />

      <NumberInput
        label="Price"
        placeholder="50.00"
        hideControls
        allowNegative={false}
        mt={12}
        size="md"
        decimalScale={2}
        key={form.key('orderPrice')}
        {...form.getInputProps('orderPrice')}
      />

      <Textarea
        label="Description"
        placeholder="Add any further information"
        maxRows={5}
        mt={12}
        size="md"
        key={form.key('orderDescription')}
        {...form.getInputProps('orderDescription')}
      />

      <Text mt={12}>Participants</Text>
      {RenderPartipantChips()}
      <Flex justify="flex-end">
        <ActionIcon
          aria-label="select everyone"
          variant="outline"
          color="black"
          onClick={setEveryMemberToOrder}
        >
          <IconUsersGroup color="black" />
        </ActionIcon>
      </Flex>
      <Text c="red">{form.errors.orderParticipants}</Text>

      <Center mt={18}>
        <SubmitButton isLoading={form.submitting} errorMessage={serverErrorMessage}>
          Submit
        </SubmitButton>
      </Center>
    </form>
  )
}
