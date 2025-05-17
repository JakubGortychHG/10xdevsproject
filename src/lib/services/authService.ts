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
    this.supabase = createSupabaseServerInstance(context);
  }

  public getClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error("Supabase client not initialized. Call initializeClient first.");
    }
    return this.supabase;
  }

  public async signIn(email: string, password: string): Promise<{ user: User; session: Session }> {
    try {
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
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        this.logger.error("Sign out failed", { error });
        throw new AuthError("Failed to sign out");
      }
    } catch (error) {
      this.logger.error("Unexpected error during sign out", { error });
      throw new AuthError("Failed to sign out");
    }
  }

  public async getUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();

      if (error) {
        this.logger.error("Failed to get user", { error });
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error("Unexpected error while getting user", { error });
      return null;
    }
  }
} 