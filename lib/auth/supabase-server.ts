import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getOptionalEnv } from "@/lib/utils/env";

export async function createSupabaseServerClient() {
  const supabaseUrl = getOptionalEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getOptionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies; middleware refreshes sessions.
        }
      },
    },
  });
}
