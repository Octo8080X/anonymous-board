import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { envConfig } from "../../util/config.ts";
import { WithSession } from "fresh_session/mod.ts";
import { validateUserInputComment } from "../../util/zod_validate.ts";
import { sanitize } from "../../util/html_sanitizer.ts";
import { TopicResource } from "../../interfaces.ts";
import Header from "../../components/header.tsx";
export const handler: Handlers = {
  async POST(req: Request, ctx: HandlerContext<WithSession>) {
    const { session } = ctx.state;
    const form = await req.formData();
    const comment = form.get("comment");
    const accountId = session.get("account") ? session.get("account").id : null;

    if (!accountId) {
      return new Response("", {
        status: 303,
        headers: { Location: "/topics" },
      });
    }

    if (typeof comment !== "string") {
      return new Response("", {
        status: 303,
        headers: { Location: req.headers.get("referer") || "/" },
      });
    }

    const sanitizedComment = sanitize(comment);

    const validateResult = validateUserInputComment(sanitizedComment);

    if (!validateResult.success) {
      session.flash("errorMessage", "入力が不適切です");
      return new Response("", {
        status: 303,
        headers: { Location: req.headers.get("referer") || "/" },
      });
    }

    const result = await fetch(
      `${envConfig.SUPABASE_EDGE_FUNCTION_END_POINT}/posts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${envConfig.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: validateResult.data,
          topic_id: ctx.params.topicId,
          account_id: accountId,
        }),
      },
    );

    if (!result.ok) {
      return new Response("", {
        status: 303,
        headers: { Location: `${new URL(req.url).pathname}` },
      });
    }

    const post = await result.json();

    if (!post.id || typeof post.id !== "number") {
      return new Response("", {
        status: 303,
        headers: { Location: `${new URL(req.url).pathname}` },
      });
    }

    return new Response("", {
      status: 303,
      headers: { Location: `${new URL(req.url).pathname}#${post.id}` },
    });
  },
  async GET(req: Request, ctx: HandlerContext<WithSession>) {
    const { session } = ctx.state;
    const publicId = session.get("account")
      ? session.get("account").public_id
      : null;

    const result = await fetch(
      `${envConfig.SUPABASE_EDGE_FUNCTION_END_POINT}/topics/${ctx.params.topicId}`,
      {
        headers: {
          Authorization: `Bearer ${envConfig.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!result.ok) {
      return ctx.render({
        isSuccess: false,
      });
    }

    const resultJson = await result.json();

    if (!resultJson.topic) {
      return ctx.render({
        isSuccess: false,
      });
    }

    const topicData: TopicResource = {
      ...resultJson,
      isSuccess: true,
      tokenStr: session.get("csrf").tokenStr,
      errorMessage: session.flash("errorMessage"),
      publicId,
    };

    return ctx.render(topicData);
  },
};

export default function Topic(props: PageProps<TopicResource>) {
  return (
    <div class="p-2">
      <Header publicId={props.data.publicId} />
      {props.data.isSuccess
        ? (
          <div>
            <div class="flex justify-between w-full mb-2 border-rl-4 border-indigo-200 bg-gray-50 p-2 font-large text-center rounded">
              <div class="w-full">
                {props.data.topic?.title}
              </div>
            </div>
            <div class="mb-2">
              {props.data.errorMessage
                ? (
                  <div class="flex justify-between w-full mb-2 border-rl-4 border-red-500 text-red-400 bg-red-100 p-2 font-large text-center rounded">
                    <div class="w-full">
                      {props.data.errorMessage}
                    </div>
                  </div>
                )
                : ""}
              <form method="POST" action={`/topics/${props.params.topicId}`}>
                <input
                  type="text"
                  name="comment"
                  placeholder="いまどうしてる？"
                  class="w-full mb-1 rounded h-12 text-lg text-center"
                />
                <input
                  type="hidden"
                  name="csrfToken"
                  value={props.data.tokenStr}
                />
                <button class="bg-indigo-400 w-full rounded py-2 text-white">
                  登録
                </button>
              </form>
            </div>

            {props.data.posts?.map((post) => (
              <div
                class="w-full mb-2 border-l-4 border-gray-400 bg-gray-50 p-4 font-medium rounded"
                key={post.id}
                id={post.id.toString()}
              >
                <div>
                  <p class="text-9x1 text-gray-600 break-all">{post.comment}</p>
                  <small>
                    <p class="text-gray-400">by {post.accounts.public_id}</p>
                  </small>
                </div>
              </div>
            ))}
          </div>
        )
        : (
          <div>
            <div class="flex justify-between w-full mb-2 border-rl-4 border-red-600 bg-gray-50 p-2 font-lerge text-center rounded">
              <div class="justify-center w-full">
                掲示板を取得できませんでした
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
