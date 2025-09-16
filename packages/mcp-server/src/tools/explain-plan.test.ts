import { describe, it, expect } from 'vitest';
import { handleExplainPlan } from './explain-plan.js';
import { ExplainPlanInputSchema } from '../types/index.js';

describe('explainPlan tool', () => {
  it('should handle valid input', async () => {
    const input = {
      workspace: './terraform/example'
    };

    const result = await handleExplainPlan(input);

    expect(result).toBeDefined();
    expect(result.summary).toContain('Analyzing workspace: ./terraform/example');
    expect(typeof result.adds).toBe('number');
    expect(typeof result.changes).toBe('number');
    expect(typeof result.destroys).toBe('number');
    expect(Array.isArray(result.resources)).toBe(true);
    expect(Array.isArray(result.risks)).toBe(true);
    expect(typeof result.evidenceMd).toBe('string');
  });

  it('should validate input schema', () => {
    const validInput = {
      workspace: './terraform/example',
      cloud: 'aws' as const,
      depth: 'full' as const
    };

    expect(() => ExplainPlanInputSchema.parse(validInput)).not.toThrow();

    const invalidInput = {
      workspace: '',
      cloud: 'invalid'
    };

    expect(() => ExplainPlanInputSchema.parse(invalidInput)).toThrow();
  });

  it('should handle missing optional parameters', async () => {
    const input = {
      workspace: './terraform/example'
    };

    const result = await handleExplainPlan(input);
    expect(result).toBeDefined();
  });
});