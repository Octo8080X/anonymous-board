import "dotenv/load.ts";

const envConfig = {
  SUPABASE_EDGE_FUNCTION_END_POINT: Deno.env.get(
    "SUPABASE_EDGE_FUNCTION_END_POINT",
  )!,
  SUPABASE_ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY")!,
  SESSION_SECONDS: Deno.env.get("SESSION_SECONDS")!,
  SECRET: Deno.env.get("SECRET")!,
  SALT: Deno.env.get("SALT")!,
};

export { envConfig };