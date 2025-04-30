import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client that can be used on client components / the browser.
 * Yes you do need to create a new client each time. For the Supabase browser clients the docs reads as follows
 * "On the client, createBrowserClient already uses a singleton pattern, 
 *  so you only ever create one instance,
 *  no matter how many times you call your createClient function."
 * 
 * Ref - https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=app
 */
export function supabaseCreateBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
