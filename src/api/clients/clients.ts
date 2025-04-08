import { createClient } from '@supabase/supabase-js';

/** Singleton Supabase Client. */
// The enviroment variables should not be null so "non-null assertion operator (!)"
export const SUPABASE_CLIENT = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
