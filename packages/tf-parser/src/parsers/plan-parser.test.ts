import { describe, it, expect } from 'vitest';
import { TerraformPlanParser } from './plan-parser.js';

describe('TerraformPlanParser', () => {
  const mockPlan = {
    format_version: '1.1',
    terraform_version: '1.0.0',
    resource_changes: [
      {
        address: 'aws_s3_bucket.example',
        module_address: undefined,
        mode: 'managed' as const,
        type: 'aws_s3_bucket',
        name: 'example',
        provider_name: 'aws',
        change: {
          actions: ['create' as const],
          before: null,
          after: {
            bucket: 'example-bucket',
            acl: 'private'
          }
        }
      },
      {
        address: 'aws_instance.web',
        module_address: undefined,
        mode: 'managed' as const,
        type: 'aws_instance',
        name: 'web',
        provider_name: 'aws',
        change: {
          actions: ['update' as const],
          before: { instance_type: 't2.micro' },
          after: { instance_type: 't3.micro' }
        }
      }
    ]
  };

  it('should parse terraform plan correctly', () => {
    const parser = new TerraformPlanParser(mockPlan);
    expect(parser).toBeInstanceOf(TerraformPlanParser);
  });

  it('should calculate summary correctly', () => {
    const parser = new TerraformPlanParser(mockPlan);
    const summary = parser.getSummary();

    expect(summary.adds).toBe(1);
    expect(summary.changes).toBe(1);
    expect(summary.destroys).toBe(0);
    expect(summary.totalResources).toBe(2);
  });

  it('should extract resource changes', () => {
    const parser = new TerraformPlanParser(mockPlan);
    const resources = parser.getResourceChanges();

    expect(resources).toHaveLength(2);
    expect(resources[0].type).toBe('aws_s3_bucket');
    expect(resources[0].action).toBe('create');
    expect(resources[1].type).toBe('aws_instance');
    expect(resources[1].action).toBe('update');
  });

  it('should filter resources by action', () => {
    const parser = new TerraformPlanParser(mockPlan);

    const creates = parser.getResourcesByAction('create');
    expect(creates).toHaveLength(1);
    expect(creates[0].type).toBe('aws_s3_bucket');

    const updates = parser.getResourcesByAction('update');
    expect(updates).toHaveLength(1);
    expect(updates[0].type).toBe('aws_instance');

    const deletes = parser.getResourcesByAction('delete');
    expect(deletes).toHaveLength(0);
  });

  it('should filter resources by type', () => {
    const parser = new TerraformPlanParser(mockPlan);
    const s3Resources = parser.getResourcesByType('aws_s3_bucket');

    expect(s3Resources).toHaveLength(1);
    expect(s3Resources[0].name).toBe('example');
  });

  it('should return terraform version', () => {
    const parser = new TerraformPlanParser(mockPlan);
    expect(parser.getTerraformVersion()).toBe('1.0.0');
  });
});