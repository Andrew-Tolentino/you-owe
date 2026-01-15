import { Stack, Button, Text } from '@mantine/core'

interface SubmitButtonProps {
  /**
   * Decides whether the button should show a loading spinner.
   */
  isLoading: boolean

  /**
   * Displays an error message.
   */
  errorMessage: string

  /**
   * Nested child component.
   */
  children: React.ReactNode
}

export default function SubmitButton({ isLoading, errorMessage='', children }: SubmitButtonProps) {
  return (
    <Stack gap="xs">
      <Button mt="md" type="submit" loading={isLoading} color="black">
        {children}
      </Button>
      <Text c="red">{errorMessage}</Text>
    </Stack>
  )
}
