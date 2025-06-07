import type { SupabaseClient, User, Session } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import { LoggerService } from "./loggerService";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class AuthService {
  private static instance: AuthService;
  private readonly logger = LoggerService.getInstance();
  private supabase!: SupabaseClient;
  private cookies?: AstroCookies;

  private constructor() {
    this.logger = LoggerService.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public initializeClient(context: {
    headers: Headers;
    cookies: AstroCookies;
  }): void {
    this.cookies = context.cookies;
    this.supabase = createSupabaseServerInstance(context);
    this.logger.debug("AuthService: Client initialized");
  }

  public getClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error(
        "Supabase client not initialized. Call initializeClient first.",
      );
    }
    return this.supabase;
  }

  public async signIn(
    email: string,
    password: string,
  ): Promise<{ user: User; session: Session }> {
    try {
      this.logger.debug("AuthService: Attempting sign in", { email });

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.logger.error("Sign in failed", { error });
        throw new AuthError("Invalid credentials");
      }

      if (!data.user || !data.session) {
        this.logger.error("No user data or session returned after sign in");
        throw new AuthError("Authentication failed");
      }

      this.logger.debug("AuthService: Sign in successful", {
        email: data.user.email,
      });

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      this.logger.error("Unexpected error during sign in", { error });
      throw new AuthError("Authentication failed");
    }
  }

  public async signOut(): Promise<void> {
    try {
      this.logger.debug("AuthService: Attempting sign out");

      const { error } = await this.supabase.auth.signOut();

      if (error) {
        this.logger.error("Sign out failed", { error });
        throw new AuthError("Failed to sign out");
      }

      this.logger.debug("AuthService: Sign out successful");
    } catch (error) {
      this.logger.error("Unexpected error during sign out", { error });
      throw new AuthError("Failed to sign out");
    }
  }

  public async getUser(): Promise<User | null> {
    try {
      this.logger.debug("AuthService: Retrieving user");

      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();

      if (error) {
        this.logger.error("Failed to get user", { error });
        return null;
      }

      this.logger.debug("AuthService: User retrieved", {
        hasUser: !!user,
        email: user?.email,
      });

      return user;
    } catch (error) {
      this.logger.error("Unexpected error while getting user", { error });
      return null;
    }
  }
}
