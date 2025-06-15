"use client"

import Link from 'next/link'
import { Text } from '@mantine/core'

import SimpleError from '@/components/SimpleError'

export default function Error() {
  return (
    <SimpleError 
      title="500"
      message="Something went wrong when trying to access this Group"
      content={
        <Link href="/">
          <Text size="sm" c="blue">Go Home</Text>
        </Link>
      }
    />
  )
}
