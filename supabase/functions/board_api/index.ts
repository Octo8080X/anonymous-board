import { createClient } from "https://esm.sh/@supabase/supabase-js@^1.33.2";
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { Router } from "https://deno.land/x/acorn/mod.ts";

export const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
);

const router = new Router();

router.get("/board_api/topics", async (ctx) => {
  const topics = await supabaseClient.from("topics").select(
    "id, title",
  );

  if (topics.error) {
    console.error(topics.error);
    throw new Error();
  }

  return { topics: topics.data };
});

router.post("/board_api/topic", async (ctx) => {
  const params = (await ctx.body()) as {
    comment: string;
    topic_id: number;
  };
  console.log(params);

  const { data, error } = await supabaseClient.from("topics").insert([
    params,
  ]).single();

  if (error) {
    console.error(error);
    throw new Error();
  }

  return { ...data };
});

await serve(
  (req) => {
    console.info(req);
    return router.handle(req);
  },
);
