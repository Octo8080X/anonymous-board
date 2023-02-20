import { HandlerContext } from "$fresh/server.ts";
import { envConfig } from "../../util/config.ts";
import { Receiver } from "@upstash/qstash/mod.ts";

const receiver = new Receiver({
  currentSigningKey: envConfig.UPSTASH_QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: envConfig.UPSTASH_QSTASH_NEXT_SIGNING_KEY,
});

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {

  if(req.method !== "POST"){ 
    console.error("not method POST");
    return new Response("", { status: 404 });
  }

  const isValid = await receiver.verify({
    signature: req.headers.get("Upstash-Signature"),
    body: await req.text(),
  }).catch((err: Error) => {
    console.error(err);
    return new Response("", { status: 404 });
  });

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  console.log(req);
  // supabase Edge Functions を呼び出す

  return new Response("", { status: 200 });
};
