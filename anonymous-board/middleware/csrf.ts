import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { matchAppRoutePath, matchRootRoutePath } from "../util/url.ts";
import { computeTokenPair, computeVerifyTokenPair } from "../util/csrf.ts";
import { Cookie, getCookies, setCookie } from "std_cookie";
import { type State } from "./session.ts";

export async function csrfHandler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const { session } = ctx.state;
  const urlObject = new URL(req.url);

  if (
    matchRootRoutePath(urlObject) || // '/' に対応
    matchAppRoutePath(urlObject) // 後で用意する '/topics' '/topic/**' に対応
  ) {
    const tmpReq = req.clone();

    if (tmpReq.method === "POST") {
      const form = await tmpReq.formData();
      const formToken = form.get("csrfToken");

      if (!formToken || typeof formToken !== "string") throw new Error();

      const cookie = getCookies(tmpReq.headers);
      const cookieToken = cookie._cookie_token;

      // 検証処理に失敗した場合は / へのリダイレクトとトークンの付与
      if (!computeVerifyTokenPair(formToken, cookieToken)) {
        const pair = computeTokenPair();
        session.set("csrf", {
          tokenStr: pair.tokenStr,
          cookieStr: pair.cookieStr,
        });
        session.flash("Error", "不適切なリクエスト");

        console.log(session);
        return new Response("", {
          status: 303,
          headers: { Location: new URL(tmpReq.url).pathname },
        });
      }
    }

    // session にトークンを持っていなければ発行
    if (!session.get("csrf")) {
      const pair = computeTokenPair();
      session.set("csrf", {
        tokenStr: pair.tokenStr,
        cookieStr: pair.cookieStr,
      });
    }

    const response = await ctx.next();

    // cookie トークンをレスポンスに付与
    if (session.has("csrf")) {
      const cookie: Cookie = {
        name: "_cookie_token",
        value: session.get("csrf").cookieStr,
        path: "/",
      };
      setCookie(response.headers, cookie);
    }
    return response;
  }
  // パスとマッチしないリクエストは、何もせず次の処理へまわす
  return ctx.next();
}
