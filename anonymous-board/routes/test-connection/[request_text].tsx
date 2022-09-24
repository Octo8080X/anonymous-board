import { Context, Handlers, PageProps } from "$fresh/server.ts";
import { envConfig } from "../../util/config.ts";

interface ResponseBody {
  message: string;
}

export const handler: Handlers<ResponseBody | null> = {
  async GET(_, ctx: Context) {
    const result = await fetch(
      envConfig.SUPABASE_EDGE_FUNCTION_END_POINT,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${envConfig.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: ctx.params.request_text }),
      },
    );
    if (result.status === 404) {
      return ctx.render(null);
    }
    const message: ResponseBody = await result.json();
    return ctx.render(message);
  },
};

export default function Greet(props: PageProps<ResponseBody>) {
  return (
    <div>
      Response <b>'{props.data.message}'</b> from supabase edge functions
    </div>
  );
}
