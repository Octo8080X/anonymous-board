import { createClient } from "https://esm.sh/@supabase/supabase-js@^1.33.2";
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { Router } from "https://deno.land/x/acorn/mod.ts";
import { datetime } from "https://deno.land/x/ptera/mod.ts";
export const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
);

const router = new Router();

router.get("/board_api/topics", async (ctx) => {
  const topics = await supabaseClient.from("topics").select(
    "id, title, accounts(public_id)",
  );

  if (topics.error) {
    console.error(topics.error);
    throw new Error();
  }

  return { topics: topics.data };
});

router.post("/board_api/topics", async (ctx) => {
  const params = (await ctx.body()) as {
    comment: string;
    account_id: number;
  };

  const { data, error } = await supabaseClient.from("topics").insert([
    params,
  ]).single();

  if (error) {
    console.error(error);
    throw new Error();
  }

  return { ...data };
});

router.get("/board_api/topics/:id", async (ctx) => {
  const topic = await supabaseClient.from("topics").select("title").eq(
    "id",
    ctx.params.id,
  ).limit(1).single();

  if (topic.error) {
    console.error(topic.error);
    throw new Error();
  }

  const posts = await supabaseClient.from("posts").select(
    "id, comment, accounts(public_id)",
  ).eq("topic_id", ctx.params.id);

  if (posts.error) {
    console.error(posts.error);
    throw new Error();
  }

  return { topic: topic.data, posts: posts.data };
});

router.post("/board_api/posts", async (ctx) => {
  const params = (await ctx.body()) as {
    comment: string;
    topic_id: number;
    account_id: number;
  };

  const { data, error } = await supabaseClient.from("posts").insert([
    params,
  ]).single();

  if (error) {
    console.error(error);
    throw new Error();
  }

  return { ...data };
});

router.post("/board_api/remove_posts", async () => {
  const now = new Date();
  const dateTime = datetime(now.setHours(now.getHours() - 1));
  const limit = dateTime.toUTC().format("YYYY-MM-dd HH:mm:ss");

  const postDeleteResult = await supabaseClient.from("posts").delete().lt(
    "created_at",
    limit,
  );

  if (postDeleteResult.statusText !== "OK") return { success: false };

  const topicsDeleteTargetResult = await supabaseClient.from("topics").select(
    "id, posts(id)",
    { count: "exact" },
  ).lt("created_at", limit);

  if (
    topicsDeleteTargetResult.statusText !== "OK" || !topicsDeleteTargetResult ||
    !topicsDeleteTargetResult.data
  ) return { success: false };

  const topicsDeleteTargets = topicsDeleteTargetResult.data.filter((
    p: { id: number; posts: any[] },
  ) => p.posts.length === 0).map((p: { id: number; posts: any[] }) => p.id);

  if (topicsDeleteTargets.length === 0) return { success: true };

  const topicsDeleteResult = await supabaseClient.from("topics").delete()
    .filter("id", "in", `(${topicsDeleteTargets.join(",")})`);

  if (topicsDeleteResult.statusText !== "OK") return { success: false };

  return { success: true };
});

router.post("/board_api/accounts", async (ctx) => {
  const params = (await ctx.body()) as { twitter_user_id: string };

  const selectResult = await supabaseClient.from("accounts").select().eq(
    "twitter_user_id",
    params.twitter_user_id,
  ).limit(1).single();

  if (selectResult.statusText === "OK") {
    return { id: selectResult.data.id, public_id: selectResult.data.public_id };
  }

  const public_id = crypto.randomUUID();

  const insertResult = await supabaseClient.from("accounts").insert([
    { twitter_user_id: params.twitter_user_id, public_id },
  ]).single();

  if (insertResult.error) {
    console.error(insertResult.error);
    throw new Error();
  }

  return { ...insertResult.data };
});

await serve(
  (req) => {
    console.info(req);
    return router.handle(req);
  },
);
