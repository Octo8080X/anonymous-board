import { Context, Handlers, PageProps } from "$fresh/server.ts";
import { envConfig } from "../util/config.ts";
import { WithSession } from "fresh_session/mod.ts";

interface Topic {
  id: number;
  title: string;
}

type Topics = Topic[];

interface TopicsResource {
  topics: Topics;
  tokenStr: string;
  errorMessage: string;
}

export const handler: Handlers = {
  async POST(req: Request, ctx: Context<WithSession>) {
    const form = await req.formData();
    const title = form.get("title");

    if (
      !title || typeof title !== "string" || title.length === 0 ||
      title.length > 90
    ) {
      return new Response("", {
        status: 303,
        headers: { Location: "/topics" },
      });
    }

    const result = await fetch(
      `${envConfig.SUPABASE_EDGE_FUNCTION_END_POINT}/topic`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${envConfig.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
        }),
      },
    );

    const topic = await result.json();

    // ここで投稿した本体の情報をチェックしますが、
    // 本来は作成した掲示板にリダイレクトさせることを目的とします。
    // 今回は、トピックの一覧ページへ戻します。

    return new Response("", {
      status: 303,
      headers: { Location: "/topics" },
    });
  },
  async GET(req: Request, ctx: Context<WithSession>) {
    const { session } = ctx.state;

    const result = await fetch(
      `${envConfig.SUPABASE_EDGE_FUNCTION_END_POINT}/topics`,
      {
        headers: {
          Authorization: `Bearer ${envConfig.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    
    const data = await result.json();
    const resource: TopicsResource = {
      ...data,
      tokenStr: session.get("csrf").tokenStr,
      errorMessage: session.flash("Error"),
    };

    return await ctx.render(resource);
  },
};

export default function Topics(props: PageProps<TopicsResource>) {
  return (
    <div class="p-2">
      <div class="mb-2">
        <form method="POST" action="/topics">
          <input
            type="text"
            name="title"
            placeholder="新しい掲示板タイトル"
            class="w-full mb-1 rounded h-12 text-lg text-center"
          />
          <input
            type="hidden"
            name="csrfToken"
            value={props.data.tokenStr}
          />
          {props.data.errorMessage
            ? (
              <div class="mt-4 h-12 p-2 bg-red-200 bg-red-200 rounded text-center text-red-500">
                {props.data.errorMessage}
              </div>
            )
            : ""}
          <button class="bg-indigo-400 w-full rounded py-2 text-white">
            登録
          </button>
        </form>
      </div>
      {!props.data.topics
        ? ""
        : props.data.topics.map((topic) => (
          <a href={"/topic/" + topic.id}>
            <div class="w-full mb-2 select-none border-l-4 border-gray-400 bg-gray-100 p-4 font-medium hover:border-blue-500">
              <div>
                <p class="text-9x1 break-all">{topic.title}</p>
              </div>
            </div>
          </a>
        ))}
    </div>
  );
}
