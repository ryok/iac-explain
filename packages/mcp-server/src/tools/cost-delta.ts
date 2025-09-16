import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  CostDeltaInputSchema,
  CostDeltaOutput,
  type CostDeltaInput
} from '../types/index.js';

export const costDeltaTool: Tool = {
  name: 'costDelta',
  description: 'Calculates cost differences between current plan and baseline branch',
  inputSchema: {
    type: 'object',
    properties: {
      workspace: {
        type: 'string',
        description: 'Terraform workspace/directory path'
      },
      baselineBranch: {
        type: 'string',
        default: 'main',
        description: 'Baseline branch for cost comparison (default: main)'
      }
    },
    required: ['workspace']
  }
};

export async function handleCostDelta(input: unknown): Promise<CostDeltaOutput> {
  const validatedInput = CostDeltaInputSchema.parse(input);

  // TODO: Implement actual cost analysis with Infracost
  const mockOutput: CostDeltaOutput = {
    reportMd: `# Cost Analysis\n\nWorkspace: ${validatedInput.workspace}\nBaseline: ${validatedInput.baselineBranch}\n\n*Implementation pending*`
  };

  return mockOutput;
}