"use client"

import { ReactNode } from 'react'
import { Stack, Title, Center, Text, Divider, Group } from '@mantine/core'

interface SimpleErrorProps {
  /**
   * Title of error
   */
  title: string

  /**
   * Message of error
   */
  message: string

  /**
   * Additional content to render There seems to be no Group with that ID
   */
  content?: ReactNode
}

/**
 * Simple static error layout.
 * 
 * @param {SimpleErrorProps} SimpleErrorProps 
 */
export default function SimpleError({ title, message, content }: SimpleErrorProps) {
  return (
    <Center h="85vh" mx="30px"> 
      <Title order={2} px="xs" style={{ textAlign: "center" }}>{title}</Title>
      <Center px="xs">
        <Divider orientation="vertical" size="xs" style={{ height: "100px" }} />
      </Center>
      <Stack px="xs">
        <Text size="sm">{message}</Text>
        {content}
      </Stack>
    </Center>
  )
}
