"use client"

import { useEffect } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { Affix, ActionIcon, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconCirclePlus } from '@tabler/icons-react'

import { supabaseCreateBrowserClient } from '@/api/clients/supabase/supabase-browser-client'
import CreateOrderForm from '@/components/CreateOrderForm'

export interface DisplayOrdersGridProps {
  /** ID of the Group the Orders belong to. */
  groupId: string

  /** ID of Member */
  memberId: string
}

/**
 * Renders a layout of Orders created within a Group for users to easily navigate through.
 * Users should also be able to create Orders here as well.
 * 
 * @param {DisplayOrdersGridProps} DisplayOrdersGridProps 
 */
export default function DisplayOrdersGrid({ groupId, memberId }: DisplayOrdersGridProps) {
  const [opened, { open, close }] = useDisclosure(false)

  // Set subscriber to listen to any Orders being created from other Users to render in realtime.
  useEffect(() => {
    let channelSubscription: RealtimeChannel | null
    async function setUpSupabaseRealTime() {
      const supabaseClient = supabaseCreateBrowserClient()
      await supabaseClient.realtime.setAuth()
      try {
        channelSubscription = supabaseClient.channel(`orders_group-${groupId}`)
        console.log('channelSubscription', channelSubscription)
        channelSubscription.on(
          'broadcast',
          { event: 'ORDER_CREATED' },
          (payload) => console.log('insert_payload', payload)
        ).on(
          'broadcast',
          { event: 'ORDER_UPDATED' },
          (payload) => console.log('update_payload', payload)
        ).subscribe((status) => {
          console.log('Channel subscription status:', status)
        })
      }
      
      catch(err) {
        console.log('err', err)
      }
    }
    setUpSupabaseRealTime()

    return (() => {
      if (channelSubscription) {
        channelSubscription.unsubscribe()
      }
    })

  }, [groupId])

  return (
    <>
      <Affix>
        <ActionIcon
          aria-label="Create Order"
          onClick={open}
        >
          <IconCirclePlus />
        </ActionIcon>
      </Affix>
      <Modal
        title="Create Order"
        opened={opened}
        onClose={close}
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        <CreateOrderForm orderCreatorMemberId={memberId} groupId={groupId} />
      </Modal>
    </>
  )
}
