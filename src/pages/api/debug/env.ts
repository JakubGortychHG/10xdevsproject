import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const envInfo = {
      timestamp: new Date().toISOString(),
      environment: "cloudflare",
      supabase_config: {
        public_url_defined: !!import.meta.env.PUBLIC_SUPABASE_URL,
        public_key_defined: !!import.meta.env.PUBLIC_SUPABASE_KEY,
        public_url_length: import.meta.env.PUBLIC_SUPABASE_URL?.length || 0,
        public_key_length: import.meta.env.PUBLIC_SUPABASE_KEY?.length || 0,
        public_url_preview: import.meta.env.PUBLIC_SUPABASE_URL
          ? `${import.meta.env.PUBLIC_SUPABASE_URL.slice(0, 20)}...`
          : "undefined",
        public_key_preview: import.meta.env.PUBLIC_SUPABASE_KEY
          ? `${import.meta.env.PUBLIC_SUPABASE_KEY.slice(0, 20)}...`
          : "undefined",
      },
      all_env_vars: Object.keys(import.meta.env).filter(
        (key) => key.includes("SUPABASE") || key.includes("supabase"),
      ),
    };

    return new Response(JSON.stringify(envInfo, null, 2), {
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
