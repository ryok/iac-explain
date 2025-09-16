import { SecurityRule, RuleContext, RuleFinding } from '../../core/rule-engine.js';

export const AwsS3PublicRule: SecurityRule = {
  id: 'TF_AWS_S3_PUBLIC',
  title: 'S3 Bucket Public Access',
  description: 'S3 bucket should not allow public access',
  severity: 'high',
  category: 'security',
  provider: 'aws',
  resourceTypes: ['aws_s3_bucket'],
  references: [
    'https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html'
  ],

  evaluate(context: RuleContext): RuleFinding | null {
    const resource = context.resource;

    // Check ACL for public access
    if (resource.acl === 'public-read' || resource.acl === 'public-read-write') {
      return {
        ruleId: this.id,
        severity: this.severity,
        title: this.title,
        description: 'S3 bucket has public ACL configuration',
        resource: {
          type: context.resourceType,
          name: context.resourceName,
          path: context.resourcePath
        },
        evidence: `ACL is set to "${resource.acl}"`,
        recommendation: 'Set ACL to "private" and configure aws_s3_bucket_public_access_block resource',
        references: this.references
      };
    }

    return null;
  }
};

export const AwsS3EncryptionRule: SecurityRule = {
  id: 'TF_AWS_S3_NO_ENCRYPTION',
  title: 'S3 Bucket Encryption',
  description: 'S3 bucket should have server-side encryption configured',
  severity: 'high',
  category: 'security',
  provider: 'aws',
  resourceTypes: ['aws_s3_bucket'],
  references: [
    'https://docs.aws.amazon.com/AmazonS3/latest/userguide/serv-side-encryption.html'
  ],

  evaluate(context: RuleContext): RuleFinding | null {
    const resource = context.resource;

    // Check for server_side_encryption_configuration
    if (!resource.server_side_encryption_configuration) {
      return {
        ruleId: this.id,
        severity: this.severity,
        title: this.title,
        description: 'S3 bucket does not have server-side encryption configured',
        resource: {
          type: context.resourceType,
          name: context.resourceName,
          path: context.resourcePath
        },
        evidence: 'Missing server_side_encryption_configuration block',
        recommendation: 'Add server_side_encryption_configuration block with AES256 or aws:kms encryption',
        references: this.references
      };
    }

    return null;
  }
};

export const AwsS3VersioningRule: SecurityRule = {
  id: 'TF_AWS_S3_NO_VERSIONING',
  title: 'S3 Bucket Versioning',
  description: 'S3 bucket should have versioning enabled',
  severity: 'med',
  category: 'best-practice',
  provider: 'aws',
  resourceTypes: ['aws_s3_bucket'],
  references: [
    'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html'
  ],

  evaluate(context: RuleContext): RuleFinding | null {
    const resource = context.resource;

    // Check versioning configuration
    if (!resource.versioning || !resource.versioning[0]?.enabled) {
      return {
        ruleId: this.id,
        severity: this.severity,
        title: this.title,
        description: 'S3 bucket does not have versioning enabled',
        resource: {
          type: context.resourceType,
          name: context.resourceName,
          path: context.resourcePath
        },
        evidence: resource.versioning ? 'Versioning is disabled' : 'Missing versioning configuration',
        recommendation: 'Enable versioning to protect against accidental deletion and modification',
        references: this.references
      };
    }

    return null;
  }
};