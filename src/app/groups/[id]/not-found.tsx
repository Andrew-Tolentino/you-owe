import Link from 'next/link'

import { Text } from '@mantine/core'
import SimpleError from '@/components/SimpleError'

export default async function NotFound() {
  return (
    <SimpleError 
      title="404"
      message="There is no Group with that ID"
      content={
        <Link href="/">
          <Text size="sm" c="blue">Go Home</Text>
        </Link>
      }
    />
  )
}
