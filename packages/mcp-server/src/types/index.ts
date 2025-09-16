import { z } from 'zod';

export const SeveritySchema = z.enum(['low', 'med', 'high', 'crit']);
export type Severity = z.infer<typeof SeveritySchema>;

export const CloudProviderSchema = z.enum(['aws', 'gcp', 'azure']);
export type CloudProvider = z.infer<typeof CloudProviderSchema>;

export const ActionSchema = z.enum(['create', 'update', 'delete']);
export type Action = z.infer<typeof ActionSchema>;

export const ResourceSchema = z.object({
  type: z.string(),
  name: z.string(),
  action: ActionSchema,
  path: z.string(),
  addr: z.string().optional()
});
export type Resource = z.infer<typeof ResourceSchema>;

export const FindingSchema = z.object({
  ruleId: z.string(),
  severity: SeveritySchema,
  resource: ResourceSchema.optional(),
  path: z.string().optional(),
  rationale: z.string(),
  recommendation: z.string(),
  evidence: z.string().optional()
});
export type Finding = z.infer<typeof FindingSchema>;

export const PatchSchema = z.object({
  file: z.string(),
  unifiedDiff: z.string(),
  preview: z.string().optional()
});
export type Patch = z.infer<typeof PatchSchema>;

export const DriftDetailSchema = z.object({
  addr: z.string(),
  field: z.string(),
  before: z.any(),
  after: z.any()
});
export type DriftDetail = z.infer<typeof DriftDetailSchema>;

export const DriftReportSchema = z.object({
  changedResources: z.number(),
  details: z.array(DriftDetailSchema)
});
export type DriftReport = z.infer<typeof DriftReportSchema>;

export const ExplainPlanInputSchema = z.object({
  workspace: z.string(),
  planPath: z.string().optional(),
  cloud: CloudProviderSchema.optional(),
  policySet: z.string().optional(),
  depth: z.enum(['fast', 'full']).default('fast')
});
export type ExplainPlanInput = z.infer<typeof ExplainPlanInputSchema>;

export const ExplainPlanOutputSchema = z.object({
  summary: z.string(),
  adds: z.number(),
  changes: z.number(),
  destroys: z.number(),
  resources: z.array(ResourceSchema),
  risks: z.array(FindingSchema),
  drift: DriftReportSchema.optional(),
  evidenceMd: z.string()
});
export type ExplainPlanOutput = z.infer<typeof ExplainPlanOutputSchema>;

export const HardeningInputSchema = z.object({
  workspace: z.string(),
  targets: z.array(z.object({
    path: z.string(),
    ruleId: z.string()
  })).optional()
});
export type HardeningInput = z.infer<typeof HardeningInputSchema>;

export const HardeningOutputSchema = z.object({
  patches: z.array(PatchSchema),
  notesMd: z.string()
});
export type HardeningOutput = z.infer<typeof HardeningOutputSchema>;

export const CostDeltaInputSchema = z.object({
  workspace: z.string(),
  baselineBranch: z.string().default('main')
});
export type CostDeltaInput = z.infer<typeof CostDeltaInputSchema>;

export const CostDeltaOutputSchema = z.object({
  monthlyDeltaUsd: z.number().optional(),
  breakdown: z.record(z.string(), z.number()).optional(),
  reportMd: z.string()
});
export type CostDeltaOutput = z.infer<typeof CostDeltaOutputSchema>;

export const ValidateK8sInputSchema = z.object({
  manifestsDir: z.string().optional(),
  helmChart: z.string().optional(),
  values: z.array(z.string()).optional()
});
export type ValidateK8sInput = z.infer<typeof ValidateK8sInputSchema>;

export const ValidateK8sOutputSchema = z.object({
  findings: z.array(FindingSchema),
  suggestions: z.array(PatchSchema),
  reportMd: z.string()
});
export type ValidateK8sOutput = z.infer<typeof ValidateK8sOutputSchema>;