"use client"

import { Tabs } from '@mantine/core'
import CreateGroupForm from './CreateGroupForm'

export default function CreateJoinGroupTabs() {
  return (
    <>
      <Tabs color='red' defaultValue="unauthn-create-group">
        <Tabs.List>
          <Tabs.Tab value="unauthn-create-group">
            Create a Group
          </Tabs.Tab>
          <Tabs.Tab value="unauthn-join-group">
            Join a Group
          </Tabs.Tab>          
        </Tabs.List>

        <Tabs.Panel value="unauthn-create-group">
          <CreateGroupForm />
        </Tabs.Panel>
        <Tabs.Panel value="unauthn-join-group">
          Join a Group Form
        </Tabs.Panel>
      </Tabs>    
    </>
  )
}
