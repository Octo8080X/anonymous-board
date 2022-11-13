import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { WithSession } from "fresh_session/mod.ts";
import { redisSession } from "../util/redis_session.ts";

export function sessionHandler(
  req: Request,
  ctx: MiddlewareHandlerContext<WithSession>,
) {
  return redisSession(req, ctx);
}
