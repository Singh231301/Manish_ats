import { z } from "zod";

export const semanticSearchSchema = z.object({
  query: z.string().min(3),
  userId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(20).default(8),
});

export type SemanticSearchInput = z.infer<typeof semanticSearchSchema>;
