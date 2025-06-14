import Link from 'next/link'

import { Container, Stack, Title } from '@mantine/core'

// TODO: Fix UI
export default async function NotFound() {
  return (
    <Container>
      <Stack align="center" justify="center">
        <Title order={1} style={{ textAlign: "center" }}>Oh No!</Title>
        <Title order={4} style={{ textAlign: "center" }}>There seems to be no Group with that ID.</Title>
        <Link href="/">
          <Title order={4} style={{ textAlign: "center" }}>Go Home</Title>
        </Link>
      </Stack>
    </Container>
  )
}
