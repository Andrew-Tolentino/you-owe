import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client that can be run on the NextJS server.
 * Yes, you do need to create a new Supabase server client each time as the docs read
 * "On the server, it basically configures a fetch call.
 *  You need to reconfigure the fetch call anew for every request to your server,
 *  because you need the cookies from the request."
 * 
 * Ref - https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=app
 */
export async function supabaseCreateServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
