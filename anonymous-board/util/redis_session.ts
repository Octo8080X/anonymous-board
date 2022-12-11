import { redisSession as redisSessionModule } from "fresh_session/mod.ts";
import { redisConnect } from "./redis.ts";
import { envConfig } from "./config.ts";

const redis = await redisConnect;

export const redisSession = redisSessionModule(redis, {
  maxAge: envConfig.SESSION_SECONDS,
  path: "/",
  httpOnly: true,
});
