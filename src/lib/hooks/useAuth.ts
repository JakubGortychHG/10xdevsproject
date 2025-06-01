import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from "astro:env/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabaseUrl = PUBLIC_SUPABASE_URL;
  const supabaseKey = PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables in client. Check configuration.",
    );
  }

  const supabase = createBrowserClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any local state
      setUser(null);

      // Force a page reload to clear any cached state
      window.location.href = "/auth/login?reason=logout";
    } catch (error) {
      console.error("Error signing out:", error);
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
