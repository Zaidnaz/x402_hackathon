import { z } from 'zod';

export const modalitySchema = z.enum(['code', 'reasoning', 'general', 'fast-chat', 'batch-summary', 'vision', 'embeddings']);
export const prioritySchema = z.enum(['cost', 'speed', 'quality', 'balanced']);

export const requirementOverridesSchema = z
  .object({
    modality: modalitySchema.optional(),
    priority: prioritySchema.optional(),
    maxBudgetAlgo: z.number().positive().max(1000).optional(),
    deadlineMs: z.number().int().positive().max(600_000).optional(),
    minQualityScore: z.number().min(0).max(100).optional(),
    estimatedInputTokens: z.number().int().positive().max(2_000_000).optional(),
    estimatedOutputTokens: z.number().int().positive().max(2_000_000).optional()
  })
  .partial();

export const promptSchema = z
  .string()
  .trim()
  .min(3, 'Prompt must be at least 3 characters')
  .max(4000, 'Prompt is too long (max 4000 characters)');

export const executeTaskBodySchema = z.object({
  prompt: promptSchema,
  overrides: requirementOverridesSchema.optional(),
  simulateFailover: z.boolean().optional(),
  humanApproved: z.boolean().optional()
});

export const updatePolicyBodySchema = z
  .object({
    dailyBudgetAlgo: z.number().positive().max(100_000).optional(),
    autoApproveThresholdAlgo: z.number().nonnegative().max(100_000).optional()
  })
  .refine((v) => v.dailyBudgetAlgo !== undefined || v.autoApproveThresholdAlgo !== undefined, {
    message: 'Provide at least one of dailyBudgetAlgo or autoApproveThresholdAlgo'
  });

export const analyzeBodySchema = z.object({
  prompt: promptSchema,
  overrides: requirementOverridesSchema.optional()
});

export const evaluateRouteBodySchema = z.object({
  prompt: promptSchema.optional(),
  requirement: z.any().optional()
}).refine((v) => v.prompt || v.requirement, { message: 'Either prompt or requirement is required' });

export const registerModelBodySchema = z.object({
  id: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  family: z.string().trim().max(80).optional(),
  contextWindow: z.number().int().positive().max(10_000_000).optional(),
  qualityBenchmark: z.number().min(0).max(100).optional(),
  costPer1kInputTokensUsd: z.number().nonnegative().max(1000),
  costPer1kOutputTokensUsd: z.number().nonnegative().max(1000).optional(),
  typicalTps: z.number().positive().max(100_000).optional(),
  reliabilityScore: z.number().min(0).max(1).optional(),
  supportedModalities: z.array(modalitySchema).optional(),
  providerOrg: z.string().trim().max(120).optional()
});

export const registerComputeBodySchema = z.object({
  id: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  gpuType: z.string().trim().min(1).max(120),
  costPerHourUsd: z.number().positive().max(1000),
  vramGb: z.number().int().positive().max(10_000).optional(),
  region: z.string().trim().max(120).optional(),
  latencyBaseMs: z.number().nonnegative().max(60_000).optional(),
  bandwidthGbps: z.number().positive().max(1_000_000).optional(),
  interconnect: z.string().trim().max(120).optional(),
  reliabilityUptime: z.number().min(0).max(100).optional(),
  currentLoad: z.number().min(0).max(100).optional(),
  algorandPayoutAddress: z.string().trim().max(80).optional(),
  endpointUrl: z.string().trim().max(300).optional()
});

/** Formats a zod error into a single readable message for API responses. */
export function formatZodError(error: z.ZodError): string {
  const issue = error.issues[0];
  const path = issue.path.length ? `${issue.path.join('.')}: ` : '';
  return `${path}${issue.message}`;
}
