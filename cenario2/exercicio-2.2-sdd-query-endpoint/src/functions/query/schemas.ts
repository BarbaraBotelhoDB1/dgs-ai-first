import { z } from "zod";

export const queryRequestSchema = z.object({
  question: z
    .string({ required_error: "question is required" })
    .trim()
    .min(1, "question must not be empty")
    .max(2000, "question must be at most 2000 characters"),
});

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

export type QueryRequest = z.infer<typeof queryRequestSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
