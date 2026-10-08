import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let clientInstance: SupabaseClient | null = null;

/**
 * Returns a singleton instance of the browser Supabase client.
 * Uses public NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Never exposes service-role keys.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(
    url &&
      key &&
      !url.includes("placeholder.supabase.co") &&
      !url.includes("your-project.supabase.co")
  );
}

export function createClient(): SupabaseClient {
  if (clientInstance) {
    return clientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    // Provide a safe placeholder instance during build or unconfigured dev environments
    // to avoid unhandled browser crashes, while isSupabaseConfigured() indicates setup state.
    clientInstance = createBrowserClient(
      "https://placeholder.supabase.co",
      "placeholder-anon-key"
    );
    return clientInstance;
  }

  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return clientInstance;
}
