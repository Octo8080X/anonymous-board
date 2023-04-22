import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { envConfig } from "../util/config.ts";
import { WithSession } from "fresh_session/mod.ts";
import { TopicsResource } from "../interfaces.ts";
import { sanitize } from "../util/html_sanitizer.ts";
import { validateUserInputTitle } from "../util/zod_validate.ts";
import CustomContainer from "../components/layout/CustomContainer.tsx";
import ErrorPostForm from "../components/ErrorPostForm.tsx";
export const handler: Handlers = {
  async POST(req: Request, ctx: HandlerContext<WithSession>) {
    const { session } = ctx.state;
    const form = await req.formData();
    const title = form.get("title");
    const accountId = session.get("account") ? session.get("account").id : null;

    if (!accountId) {
      return new Response("", {
        status: 303,
        headers: { Location: "/topics" },
      });
    }

    if (typeof title !== "string") {
      return new Response("", {
        status: 303,
        headers: { Location: "/topics" },
      });
    }

    if (typeof title !== "string") {
      return new Response("", {
        status: 303,
        headers: { Location: req.headers.get("referer") || "/" },
      });
    }

    const sanitizedTitle = sanitize(title);

    const validateResult = validateUserInputTitle(sanitizedTitle);

    if (!validateResult.success) {
      session.flash("errorMessage", "入力が不適切です");
      return new Response("", {
        status: 303,
        headers: { Location: req.headers.get("referer") || "/" },
      });
    }

    const result = await fetch(
      `${envConfig.SUPABASE_EDGE_FUNCTION_END_POINT}/topics`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${envConfig.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: validateResult.data,
          account_id: accountId,
        }),
      },
    );

    const topic = await result.json();

    return new Response("", {
      status: 303,
      headers: { Location: `/topics/${topic.id}` },
    });
  },
  async GET(req: Request, ctx: HandlerContext<WithSession>) {
    const { session } = ctx.state;
    const publicId = session.get("account")
      ? session.get("account").public_id
      : null;

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
      errorMessage: session.flash("errorMessage"),
      publicId,
    };

    return await ctx.render(resource);
  },
};

interface TopicPostFormProps {
  tokenStr: string;
  errorMessage?: string;
}

function TopicPostForm(props: TopicPostFormProps) {
  return (
    <form method="POST" action="/topics">
      <input
        type="text"
        name="title"
        placeholder="新しい掲示板タイトル"
        class="w-full mb-1 rounded h-12 text-lg text-center border-2 border-gray-200"
      />
      <input type="hidden" name="csrfToken" value={props.tokenStr} />
      {props.errorMessage
        ? <ErrorPostForm errorMessage={props.errorMessage} />
        : (
          ""
        )}
      <button class="bg-indigo-400 w-full rounded py-2 text-white">
        登録
      </button>
    </form>
  );
}

interface TopicProps {
  id: number;
  title: string;
  publicId: string;
}

function Topic({ id, title, publicId }: TopicProps) {
  return (
    <a href={"/topics/" + id}>
      <div class="w-full mb-2 select-none border-l-4 border-gray-400 bg-gray-100 p-4 font-medium hover:border-blue-500">
        <div>
          <p class="text-9x1 break-all">{title}</p>
          <small>
            <p class="text-gray-400">by {publicId}</p>
          </small>
        </div>
      </div>
    </a>
  );
}

export default function Topics(props: PageProps<TopicsResource>) {
  console.log(props);
  return (
    <CustomContainer title="トピック一覧" publicId={props.data.publicId}>
      <div class="mb-2">
        <TopicPostForm
          tokenStr={props.data.tokenStr}
          errorMessage={props.data.errorMessage}
        />
      </div>
      {!props.data.topics ? "" : props.data.topics.map((topic) => (
        <Topic
          id={topic.id}
          title={topic.title}
          publicId={topic.accounts.public_id}
        />
      ))}
    </CustomContainer>
  );
}
