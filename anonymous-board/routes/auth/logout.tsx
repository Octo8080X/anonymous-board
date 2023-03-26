import { Context, Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(req: Request, ctx: Context) {
    const referer = req.headers.get("referer");
    const { session } = ctx.state;

    session.clear();

    return new Response("", {
      status: 303,
      headers: { Location: referer },
    });
  },
};
