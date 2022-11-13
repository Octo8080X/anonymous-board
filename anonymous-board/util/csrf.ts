import {
  computeHmacTokenPair,
  computeVerifyHmacTokenPair,
} from "deno_csrf/mod.ts";
import { envConfig } from "./config.ts";

export function computeTokenPair() {
  return computeHmacTokenPair(envConfig.SECRET, envConfig.SALT);
}

export function computeVerifyTokenPair(tokenStr: string, cookieStr: string) {
  return computeVerifyHmacTokenPair(envConfig.SECRET, tokenStr, cookieStr);
}
