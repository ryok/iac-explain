import { z } from 'zod';

export const TerraformValueSchema = z.any();

export const ResourceChangeSchema = z.object({
  address: z.string(),
  module_address: z.string().optional(),
  mode: z.enum(['managed', 'data']),
  type: z.string(),
  name: z.string(),
  provider_name: z.string(),
  change: z.object({
    actions: z.array(z.enum(['no-op', 'create', 'read', 'update', 'delete'])),
    before: TerraformValueSchema.nullable(),
    after: TerraformValueSchema.nullable(),
    after_unknown: z.record(z.boolean()).optional(),
    before_sensitive: z.record(z.boolean()).optional(),
    after_sensitive: z.record(z.boolean()).optional()
  })
});
export type ResourceChange = z.infer<typeof ResourceChangeSchema>;

export const ConfigurationSchema = z.object({
  provider_config: z.record(z.any()).optional(),
  root_module: z.object({
    resources: z.array(z.object({
      address: z.string(),
      mode: z.enum(['managed', 'data']),
      type: z.string(),
      name: z.string(),
      provider_config_key: z.string().optional(),
      expressions: z.record(z.any()).optional(),
      schema_version: z.number().optional()
    })).optional(),
    module_calls: z.record(z.any()).optional()
  })
});
export type Configuration = z.infer<typeof ConfigurationSchema>;

export const TerraformPlanSchema = z.object({
  format_version: z.string(),
  terraform_version: z.string(),
  variables: z.record(z.object({
    value: TerraformValueSchema
  })).optional(),
  planned_values: z.object({
    root_module: z.object({
      resources: z.array(z.object({
        address: z.string(),
        mode: z.enum(['managed', 'data']),
        type: z.string(),
        name: z.string(),
        provider_name: z.string(),
        schema_version: z.number().optional(),
        values: z.record(TerraformValueSchema)
      })).optional(),
      child_modules: z.array(z.any()).optional()
    }).optional()
  }).optional(),
  resource_changes: z.array(ResourceChangeSchema),
  configuration: ConfigurationSchema.optional(),
  prior_state: z.object({
    format_version: z.string(),
    terraform_version: z.string(),
    values: z.any().optional()
  }).optional()
});
export type TerraformPlan = z.infer<typeof TerraformPlanSchema>;

export interface PlanSummary {
  adds: number;
  changes: number;
  destroys: number;
  totalResources: number;
}

export interface ResourceInfo {
  address: string;
  type: string;
  name: string;
  provider: string;
  action: 'create' | 'update' | 'delete' | 'no-op';
  before: Record<string, any> | null;
  after: Record<string, any> | null;
}