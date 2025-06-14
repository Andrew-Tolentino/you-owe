"use client"

import { Container, Stack, Title } from '@mantine/core'
import Link from 'next/link'

export default function Error({ _error }: {
  error: Error & { digest?: string }
}) {
  return (
    <Container>
      <Stack align="center" justify="center">
        <Title order={1} style={{ textAlign: "center" }}>Oh No!</Title>
        <Title order={4} style={{ textAlign: "center" }}>Something went wrong when trying to access this Group!.</Title>
        <Title order={4} style={{ textAlign: "center" }}>If this persists, try creating a new User by hard refreshing your web browser and then going to the Home Page.</Title>
        <Link href="/">
          <Title order={4} style={{ textAlign: "center" }}>Go Home</Title>
        </Link>
      </Stack>
    </Container>
  )
}
