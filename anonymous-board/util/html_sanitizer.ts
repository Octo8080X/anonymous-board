import * as ammonia from "ammonia";
await ammonia.init();

export function sanitize(text: string) {
  return ammonia.clean(text);
}
