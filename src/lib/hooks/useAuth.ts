import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface AuthActions {
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAuth(): AuthState & AuthActions {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    // Create Supabase client using import.meta.env
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration");
      setAuthState({ user: null, session: null, loading: false });
      return;
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseKey);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (mounted) {
        if (error) {
          console.error("Error getting session:", error);
          setAuthState({ user: null, session: null, loading: false });
        } else {
          setAuthState({
            user: session?.user ?? null,
            session,
            loading: false,
          });
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createBrowserClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_KEY,
    );
    await supabase.auth.signOut();
  };

  const refreshSession = async () => {
    const supabase = createBrowserClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_KEY,
    );
    await supabase.auth.refreshSession();
  };

  return {
    ...authState,
    signOut,
    refreshSession,
  };
}
