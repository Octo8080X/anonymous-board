import { z } from "zod";

const userInputCommentSchema = z.string().min(1).max(140);
const userInputTitleSchema = z.string().min(1).max(90);

export function validateUserInputComment(src: unknown) {
  return userInputCommentSchema.safeParse(src);
}

export function validateUserInputTitle(src: unknown) {
  return userInputTitleSchema.safeParse(src);
}
