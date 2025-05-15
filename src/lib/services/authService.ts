import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';
import { LoggerService } from './loggerService';

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthService {
  private static instance: AuthService;
  private readonly logger = LoggerService.getInstance();
  private supabase: SupabaseClient;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private cookieOptions: CookieOptions = {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
  };

  public initializeClient(context: {
    headers: Headers;
    cookies: AstroCookies;
  }): void {
    this.supabase = createServerClient(
      import.meta.env.SUPABASE_URL!,
      import.meta.env.SUPABASE_PUBLIC_KEY!,
      {
        cookies: {
          get(key: string) {
            return context.cookies.get(key)?.value;
          },
          set(key: string, value: string, options) {
            context.cookies.set(key, value, options);
          },
          remove(key: string, options) {
            context.cookies.delete(key, options);
          },
        },
      },
    );
  }

  public async signIn(email: string, password: string): Promise<User> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.logger.error('Sign in failed', { error });
        throw new AuthError('Invalid credentials');
      }

      if (!data.user) {
        this.logger.error('No user data returned after sign in');
        throw new AuthError('Authentication failed');
      }

      return data.user;
    } catch (error) {
      this.logger.error('Unexpected error during sign in', { error });
      throw new AuthError('Authentication failed');
    }
  }

  public async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        this.logger.error('Sign out failed', { error });
        throw new AuthError('Failed to sign out');
      }
    } catch (error) {
      this.logger.error('Unexpected error during sign out', { error });
      throw new AuthError('Failed to sign out');
    }
  }

  public async getUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();

      if (error) {
        this.logger.error('Failed to get user', { error });
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error('Unexpected error while getting user', { error });
      return null;
    }
  }
} 