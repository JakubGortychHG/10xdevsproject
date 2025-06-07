import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Get cookie header
    const cookieHeader = request.headers.get("Cookie");

    // Parse cookies manually for debugging
    const parsedCookies = cookieHeader
      ? cookieHeader
          .split(";")
          .map((cookie) => {
            const [name, ...rest] = cookie.split("=").map((c) => c.trim());
            return { name, value: rest.join("=") };
          })
          .filter((cookie) => cookie.name && cookie.value)
      : [];

    // Create Supabase client
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Try to get user with fallback mechanism (same as middleware)
    let userInfo = null;
    let authError = null;
    let fallbackUsed = false;

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        authError = {
          name: error.name,
          message: error.message,
          status: error.status,
        };

        // IMPORTANT: Check if the error from getUser() contains 1003
        if (error.message && error.message.includes("1003")) {
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            if (session?.user) {
              userInfo = {
                id: session.user.id,
                email: session.user.email,
                created_at: session.user.created_at,
                last_sign_in_at: session.user.last_sign_in_at,
              };
              fallbackUsed = true;
              authError = {
                ...authError,
                fallback_note:
                  "User recovered from session after 1003 error in response",
              };
            }
          } catch (sessionError) {
            authError = {
              ...authError,
              session_fallback_error:
                sessionError instanceof Error
                  ? sessionError.message
                  : String(sessionError),
            };
          }
        }
      } else {
        userInfo = data.user
          ? {
              id: data.user.id,
              email: data.user.email,
              created_at: data.user.created_at,
              last_sign_in_at: data.user.last_sign_in_at,
            }
          : null;
      }
    } catch (error) {
      authError = {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
      };

      // Apply fallback logic for thrown errors with 1003
      if (error instanceof Error && error.message.includes("1003")) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user) {
            userInfo = {
              id: session.user.id,
              email: session.user.email,
              created_at: session.user.created_at,
              last_sign_in_at: session.user.last_sign_in_at,
            };
            fallbackUsed = true;
            authError = {
              ...authError,
              fallback_note:
                "User recovered from session after 1003 error in catch",
            };
          }
        } catch (sessionError) {
          authError = {
            ...authError,
            session_fallback_error:
              sessionError instanceof Error
                ? sessionError.message
                : String(sessionError),
          };
        }
      }
    }

    // Get session info
    let sessionInfo = null;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        sessionInfo = {
          access_token: session.access_token ? "present" : "missing",
          refresh_token: session.refresh_token ? "present" : "missing",
          expires_at: session.expires_at,
          expires_in: session.expires_in,
          token_type: session.token_type,
        };
      }
    } catch {
      // Session error will be included in debug info
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: "cloudflare",
      cookies: {
        header_present: !!cookieHeader,
        header_length: cookieHeader?.length || 0,
        parsed_count: parsedCookies.length,
        supabase_cookies: parsedCookies.filter(
          (c) =>
            c.name.includes("supabase") ||
            c.name.includes("sb-") ||
            c.name.includes("auth"),
        ),
        all_cookie_names: parsedCookies.map((c) => c.name),
      },
      auth: {
        user: userInfo,
        error: authError,
        session: sessionInfo,
        fallback_used: fallbackUsed,
        debug_notes: {
          error_contains_1003: authError
            ? authError.message.includes("1003")
            : false,
          error_type: authError ? typeof authError.message : "no_error",
          raw_error_message: authError ? authError.message : null,
        },
      },
      headers: {
        user_agent: request.headers.get("User-Agent") || "unknown",
        origin: request.headers.get("Origin") || "unknown",
        referer: request.headers.get("Referer") || "unknown",
      },
    };

    return new Response(JSON.stringify(debugInfo, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify(
        {
          error: "Debug endpoint failed",
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
};
