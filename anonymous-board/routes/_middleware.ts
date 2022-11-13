import { sessionHandler } from "../middleware/session.ts";
import { csrfHandler } from "../middleware/csrf.ts";

export const handler = [
  sessionHandler,
  csrfHandler,
];
