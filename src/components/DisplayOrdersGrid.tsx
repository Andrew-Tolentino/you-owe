"use client"

import { useEffect } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'

import { supabaseCreateBrowserClient } from '@/api/clients/supabase/supabase-browser-client'

export interface DisplayOrdersGridProps {
  /** ID of the Group the Orders belong to. */
  groupId: string
}

export default function DisplayOrdersGrid({ groupId }: DisplayOrdersGridProps) {
  
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
    <h1>Test</h1>
  )
}
