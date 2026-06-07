import { z } from "zod";

export const createAnalysisSchema = z.object({
  userId: z.string().uuid().optional(),
  resumeText: z.string().min(80, "Resume text must contain at least 80 characters"),
  jobDescription: z.string().min(50).optional(),
  filename: z.string().max(180).optional(),
  targetRole: z.string().max(120).optional(),
});

export const optimizeSchema = z.object({
  analysisId: z.string().uuid().optional(),
  resumeText: z.string().min(80),
  jobDescription: z.string().min(50).optional(),
  tone: z.enum(["direct", "executive", "technical"]).default("direct"),
});

export type CreateAnalysisInput = z.infer<typeof createAnalysisSchema>;
export type OptimizeInput = z.infer<typeof optimizeSchema>;
