import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";

// Konfiguracja zgodna z @supabase-auth.mdc guidelines
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

// KLUCZOWA funkcja zgodna z @supabase-auth.mdc - była brakująca!
const parseCookieHeader = (
  cookieHeader: string,
): { name: string; value: string }[] => {
  if (!cookieHeader) return [];

  return cookieHeader
    .split(";")
    .map((cookie) => {
      const [name, ...rest] = cookie.split("=").map((c) => c.trim());
      const value = rest.join("=");
      return { name, value };
    })
    .filter((cookie) => cookie.name && cookie.value);
};

export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
}) => {
  // Używamy import.meta.env zgodnie z guidelines zamiast astro:env/client
  if (
    !import.meta.env.PUBLIC_SUPABASE_URL ||
    !import.meta.env.PUBLIC_SUPABASE_KEY
  ) {
    throw new Error(
      "Missing Supabase environment variables. Check .env file and ensure variables are properly configured",
    );
  }

  const supabase = createServerClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_KEY,
    {
      cookieOptions,
      cookies: {
        // KLUCZOWE: TYLKO getAll/setAll zgodnie z @supabase-auth.mdc
        getAll() {
          const cookieHeader = context.headers.get("Cookie") ?? "";
          const cookies = parseCookieHeader(cookieHeader);

          console.log("Getting cookies:", {
            cookieHeaderLength: cookieHeader.length,
            parsedCount: cookies.length,
            supabaseCookies: cookies.filter((c) => c.name.startsWith("sb-"))
              .length,
          });

          return cookies;
        },
        setAll(cookiesToSet) {
          console.log("Setting cookies:", {
            count: cookiesToSet.length,
            names: cookiesToSet.map((c) => c.name),
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              context.cookies.set(name, value, options);
            } catch (error) {
              console.error("Error setting cookie:", { name, error });
            }
          });
        },
      },
    },
  );

  return supabase;
};
