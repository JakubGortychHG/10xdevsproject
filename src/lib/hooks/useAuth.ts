import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from "astro:env/client";
import { LoggerService } from "../services/loggerService";

// Deklaracja typu dla window.__USER_DATA__
declare global {
  interface Window {
    __USER_DATA__?: { id: string; email: string } | null;
  }
}

export function useAuth() {
  // Ref do śledzenia, czy dane pochodzą z serwera
  const isServerDataRef = useRef(false);

  // Inicjalizujemy stan użytkownika danymi wstrzykniętymi przez serwer, jeśli istnieją
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined" && window.__USER_DATA__) {
      isServerDataRef.current = true; // Oznacz, że używamy danych z serwera
      return window.__USER_DATA__ as User;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  const supabaseUrl = PUBLIC_SUPABASE_URL;
  const supabaseKey = PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables in client. Check configuration.",
    );
  }

  // Supabase konfiguracja dla klienta
  const supabase = createBrowserClient(supabaseUrl, supabaseKey, {
    // Odpowiadają konfiguracji po stronie serwera
    cookieOptions: {
      path: "/",
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 dni
    },
  });

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        // Jeśli mamy dane użytkownika wstrzyknięte przez serwer, nie musimy sprawdzać sesji
        if (window.__USER_DATA__) {
          setIsLoading(false);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          isServerDataRef.current = false; // Oznacz, że używamy danych z sesji
        } else {
          // Tylko ustaw na null jeśli nie mamy danych z serwera
          if (!isServerDataRef.current) {
            setUser(null);
          }
        }
      } catch (error) {
        LoggerService.getInstance().error("useAuth: Error getting session", {
          error: error instanceof Error ? error.message : String(error),
        });
        // Tylko ustaw na null jeśli nie mamy danych z serwera
        if (!isServerDataRef.current) {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Jeśli to tylko INITIAL_SESSION i mamy dane z serwera, ignoruj to
      if (event === "INITIAL_SESSION" && isServerDataRef.current) {
        return;
      }

      if (session?.user) {
        setUser(session.user);
        isServerDataRef.current = false; // Oznacz, że używamy danych z sesji
      } else {
        // Tylko przy wylogowaniu (SIGNED_OUT) lub innych eventach, nie przy INITIAL_SESSION
        if (event === "SIGNED_OUT" || !isServerDataRef.current) {
          setUser(null);
          isServerDataRef.current = false;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any local state
      setUser(null);
      isServerDataRef.current = false;

      // Wyczyść dane użytkownika wstrzyknięte przez serwer
      if (typeof window !== "undefined") {
        window.__USER_DATA__ = null;
      }

      // Force a page reload to clear any cached state
      window.location.href = "/auth/login?reason=logout";
    } catch (error) {
      LoggerService.getInstance().error("useAuth: Error signing out", {
        error: error instanceof Error ? error.message : String(error),
      });
      // Still redirect on error, but with an error parameter
      window.location.href = "/auth/login?error=signout_failed";
    }
  };

  return {
    user,
    isLoading,
    signOut,
  };
}
