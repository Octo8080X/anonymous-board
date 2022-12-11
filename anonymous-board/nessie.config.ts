import {
  ClientPostgreSQL,
  NessieConfig,
} from "https://deno.land/x/nessie@2.0.10/mod.ts";
import "dotenv/load.ts";

const client = new ClientPostgreSQL({
  database: Deno.env.get("SUPABASE_POSTGRES_DB")!,
  hostname: Deno.env.get("SUPABASE_POSTGRES_HOST")!,
  port: Deno.env.get("SUPABASE_POSTGRES_PORT")!,
  user: Deno.env.get("SUPABASE_POSTGRES_USER")!,
  password: Deno.env.get("SUPABASE_POSTGRES_PASSWORD")!,
});

/** This is the final config object */
const config: NessieConfig = {
  client,
  migrationFolders: ["./db/migrations"],
  seedFolders: ["./db/seeds"],
};

export default config;
