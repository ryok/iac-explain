import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  ExplainPlanInputSchema,
  ExplainPlanOutput,
  type ExplainPlanInput
} from '../types/index.js';

export const explainPlanTool: Tool = {
  name: 'explainPlan',
  description: 'Analyzes Terraform plans and provides comprehensive summary with risk assessment',
  inputSchema: {
    type: 'object',
    properties: {
      workspace: {
        type: 'string',
        description: 'Terraform workspace/directory path'
      },
      planPath: {
        type: 'string',
        description: 'Path to existing plan file or JSON (optional)'
      },
      cloud: {
        type: 'string',
        enum: ['aws', 'gcp', 'azure'],
        description: 'Cloud provider for targeted analysis (optional)'
      },
      policySet: {
        type: 'string',
        description: 'Policy set reference from .iac-explain.yml (optional)'
      },
      depth: {
        type: 'string',
        enum: ['fast', 'full'],
        default: 'fast',
        description: 'Analysis depth level'
      }
    },
    required: ['workspace']
  }
};

export async function handleExplainPlan(input: unknown): Promise<ExplainPlanOutput> {
  const validatedInput = ExplainPlanInputSchema.parse(input);

  // TODO: Implement actual Terraform plan analysis
  // For now, return a mock response
  const mockOutput: ExplainPlanOutput = {
    summary: `Analyzing workspace: ${validatedInput.workspace}`,
    adds: 0,
    changes: 0,
    destroys: 0,
    resources: [],
    risks: [],
    evidenceMd: '# Analysis pending implementation'
  };

  return mockOutput;
}