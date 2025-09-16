import { describe, it, expect } from 'vitest';
import { AwsS3PublicRule, AwsS3EncryptionRule, AwsS3VersioningRule } from './aws-s3-rules.js';
import { RuleContext } from '../../core/rule-engine.js';

describe('AWS S3 Rules', () => {
  describe('AwsS3PublicRule', () => {
    it('should detect public-read ACL', () => {
      const context: RuleContext = {
        resource: { acl: 'public-read' },
        resourceType: 'aws_s3_bucket',
        resourceName: 'test-bucket'
      };

      const finding = AwsS3PublicRule.evaluate(context);
      expect(finding).toBeTruthy();
      expect(finding?.severity).toBe('high');
      expect(finding?.ruleId).toBe('TF_AWS_S3_PUBLIC');
      expect(finding?.evidence).toContain('public-read');
    });

    it('should detect public-read-write ACL', () => {
      const context: RuleContext = {
        resource: { acl: 'public-read-write' },
        resourceType: 'aws_s3_bucket',
        resourceName: 'test-bucket'
      };

      const finding = AwsS3PublicRule.evaluate(context);
      expect(finding).toBeTruthy();
      expect(finding?.evidence).toContain('public-read-write');
    });

    it('should not flag private ACL', () => {
      const context: RuleContext = {
        resource: { acl: 'private' },
        resourceType: 'aws_s3_bucket',
        resourceName: 'test-bucket'
      };

      const finding = AwsS3PublicRule.evaluate(context);
      expect(finding).toBeNull();
    });
  });

  describe('AwsS3EncryptionRule', () => {
    it('should detect missing encryption', () => {
      const context: RuleContext = {
        resource: { bucket: 'test-bucket' },
        resourceType: 'aws_s3_bucket',
        resourceName: 'test-bucket'
      };

      const finding = AwsS3EncryptionRule.evaluate(context);
      expect(finding).toBeTruthy();
      expect(finding?.severity).toBe('high');
      expect(finding?.ruleId).toBe('TF_AWS_S3_NO_ENCRYPTION');
    });

    it('should not flag bucket with encryption', () => {
      const context: RuleContext = {
        resource: {
          bucket: 'test-bucket',
          server_side_encryption_configuration: {
            rule: {
              apply_server_side_encryption_by_default: {
                sse_algorithm: 'AES256'
              }
            }
          }
        },
        resourceType: 'aws_s3_bucket',
        resourceName: 'test-bucket'
      };

      const finding = AwsS3EncryptionRule.evaluate(context);
      expect(finding).toBeNull();
    });
  });

  describe('AwsS3VersioningRule', () => {
    it('should detect missing versioning', () => {
      const context: RuleContext = {
        resource: { bucket: 'test-bucket' },
        resourceType: 'aws_s3_bucket',
        resourceName: 'test-bucket'
      };

      const finding = AwsS3VersioningRule.evaluate(context);
      expect(finding).toBeTruthy();
      expect(finding?.severity).toBe('med');
      expect(finding?.ruleId).toBe('TF_AWS_S3_NO_VERSIONING');
    });

    it('should detect disabled versioning', () => {
      const context: RuleContext = {
        resource: {
          bucket: 'test-bucket',
          versioning: [{ enabled: false }]
        },
        resourceType: 'aws_s3_bucket',
        resourceName: 'test-bucket'
      };

      const finding = AwsS3VersioningRule.evaluate(context);
      expect(finding).toBeTruthy();
    });

    it('should not flag enabled versioning', () => {
      const context: RuleContext = {
        resource: {
          bucket: 'test-bucket',
          versioning: [{ enabled: true }]
        },
        resourceType: 'aws_s3_bucket',
        resourceName: 'test-bucket'
      };

      const finding = AwsS3VersioningRule.evaluate(context);
      expect(finding).toBeNull();
    });
  });
});