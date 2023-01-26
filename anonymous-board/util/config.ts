import "dotenv/load.ts";

const envConfig = {
  SUPABASE_EDGE_FUNCTION_END_POINT: Deno.env.get(
    "SUPABASE_EDGE_FUNCTION_END_POINT",
  )!,
  SUPABASE_ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY")!,
  SESSION_SECONDS: Deno.env.get("SESSION_SECONDS")!,
  SECRET: Deno.env.get("SECRET")!,
  SALT: Deno.env.get("SALT")!,
  DENO_ENV: Deno.env.get("DENO_ENV")!,
  UPSTASH_REDIS_REST_URL: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
  UPSTASH_REDIS_REST_TOKEN: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
};

export { envConfig };
