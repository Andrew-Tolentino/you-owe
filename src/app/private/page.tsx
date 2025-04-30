import { supabaseCreateServerClient } from '@/api/clients/supabase/supabase-server-client'

export default async function Page() {
  const supabase = await supabaseCreateServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    console.log('Private Page Error', error, data)
    return (
      <p>User is not logged in!</p>
    )
  }

  console.log('User authenticated!', data.user)
  return (
    <p>Logged in user!</p>
  )
}
