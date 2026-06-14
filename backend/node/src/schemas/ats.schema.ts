import { z } from "zod";

export const atsSimulateSchema = z.object({
  resumeText: z.string().min(10),
  atsTarget: z.string().min(2),
});

export const heatmapSchema = z.object({
  resumeText: z.string().min(10),
  jobDescription: z.string().optional(),
});

export const ontologyMatchSchema = z.object({
  resumeSkills: z.array(z.string()),
  jdSkills: z.array(z.string()),
});

export const ontologyExpandSchema = z.object({
  skills: z.array(z.string()),
});
