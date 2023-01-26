import { envConfig } from "./config.ts";
import { connect } from "redis/mod.ts";
import { Redis } from "upstash_redis/mod.ts";

export const redisConnect = (() => {
  if (envConfig.DENO_ENV === "development") {
    return connect({
      hostname: "redis",
      port: 6379,
    });
  }
  return new Redis({
    url: envConfig.UPSTASH_REDIS_REST_URL,
    token: envConfig.UPSTASH_REDIS_REST_TOKEN,
    automaticDeserialization: false, //デフォルト設定では自動でJSONのパースをしてしまうので機能をOFFに
  });
})();
