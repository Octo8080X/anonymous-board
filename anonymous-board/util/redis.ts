import { connect } from "redis/mod.ts";

export const redisConnect = (() => {
  return connect({
    hostname: "redis",
    port: 6379,
  });
  // 後で Deno Deploy 環境で Redisを使う際のモジュール切り替えを行うので
  // 即時関数の処理結果としてクライアントを返すようにしておきます。
})();
