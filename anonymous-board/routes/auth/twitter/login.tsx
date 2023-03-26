import { Context, Handlers, ResponseBody } from "$fresh/server.ts";
import { envConfig } from "../../../util/config.ts";
import {
  getAuthenticateLink,
  type GetAuthLinkParam,
} from "twitter_oauth/mod.ts";

const oauthConsumerKey = envConfig.TWITTER_API_KEY;
const oauthConsumerSecret = envConfig.TWITTER_API_SECRET;
const oauthCallback = envConfig.TWITTER_CALLBACK_URL;

const authParam: GetAuthLinkParam = {
  oauthConsumerKey,
  oauthConsumerSecret,
  oauthCallback,
};

function matchHost(src: string): boolean {
  const url = new URLPattern(src);
  return url.hostname == envConfig.HOST;
}

function getDefaultRedirectURL(protocol: string): string {
  if (!envConfig.PORT) return `${protocol}://${envConfig.HOST}`;
  return `${protocol}://${envConfig.HOST}:${envConfig.PORT}`;
}

export const handler: Handlers<ResponseBody | null> = {
  async GET(req: Request, ctx: Context) {
    const { session } = ctx.state;
    const referer = req.headers.get("referer");
    const protocol = new URLPattern(req.url).protocol;

    if (!referer || !matchHost(referer)) {
      return new Response("", {
        status: 303,
        headers: { Location: getDefaultRedirectURL(protocol) },
      });
    }

    const urlResponse = await getAuthenticateLink(authParam);
    session.set("oauthTokenSecret", urlResponse.oauthTokenSecret);
    session.set("referer_path", referer);

    return new Response("", {
      status: 303,
      headers: { Location: urlResponse.url },
    });
  },
};
