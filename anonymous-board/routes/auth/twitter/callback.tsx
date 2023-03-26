import { Context, Handlers, ResponseBody } from "$fresh/server.ts";
import { envConfig } from "../../../util/config.ts";
import { getAccessToken } from "twitter_oauth/mod.ts";

const oauthConsumerKey = envConfig.TWITTER_API_KEY;
const oauthConsumerSecret = envConfig.TWITTER_API_SECRET;

export const handler: Handlers<ResponseBody | null> = {
  async GET(req: Request, ctx: Context) {
    const { session } = ctx.state;
    const query = new URL(req.url).searchParams;
    const denied = query.get("denied");
    const oauthToken = query.get("oauth_token");
    const oauthVerifier = query.get("oauth_verifier");

    if (denied || !oauthToken || !oauthVerifier) {
      return new Response("", {
        status: 303,
        headers: { Location: "/" },
      });
    }

    const oauthTokenSecret = await ctx.state.session.get("oauthTokenSecret");

    const accessToken = await getAccessToken({
      oauthConsumerKey,
      oauthConsumerSecret,
      oauthToken: oauthToken.toString(),
      oauthVerifier: oauthVerifier.toString(),
      oauthTokenSecret,
    });

    if (!accessToken.status) {
      return new Response("", {
        status: 303,
        headers: { Location: "/" },
      });
    }

    const result = await fetch(
      `${envConfig.SUPABASE_EDGE_FUNCTION_END_POINT}/accounts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${envConfig.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitter_user_id: accessToken.userId,
        }),
      },
    );

    if (!result.ok) {
      return new Response("", {
        status: 303,
        headers: { Location: "/" },
      });
    }

    const account = await result.json();
    session.set("account", account);

    const refererPath = session.get("referer_path");

    return new Response("", {
      status: 303,
      headers: { Location: refererPath },
    });
  },
};
