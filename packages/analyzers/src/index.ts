export * from './core/rule-engine.js';

// Terraform rules
export * from './rules/terraform/aws-s3-rules.js';
export * from './rules/terraform/aws-security-group-rules.js';

// Kubernetes rules
export * from './rules/kubernetes/security-rules.js';

import { RuleEngine } from './core/rule-engine.js';
import { AwsS3PublicRule, AwsS3EncryptionRule, AwsS3VersioningRule } from './rules/terraform/aws-s3-rules.js';
import { AwsSecurityGroupOpenAllRule, AwsSecurityGroupSSHRule } from './rules/terraform/aws-security-group-rules.js';
import { K8sNoLimitsRule, K8sPrivilegeEscalationRule, K8sRunAsRootRule, K8sLatestTagRule } from './rules/kubernetes/security-rules.js';

// Create default rule engine with all rules
export function createDefaultRuleEngine(): RuleEngine {
  const engine = new RuleEngine();

  // Register Terraform rules
  engine.registerRules([
    AwsS3PublicRule,
    AwsS3EncryptionRule,
    AwsS3VersioningRule,
    AwsSecurityGroupOpenAllRule,
    AwsSecurityGroupSSHRule
  ]);

  // Register Kubernetes rules
  engine.registerRules([
    K8sNoLimitsRule,
    K8sPrivilegeEscalationRule,
    K8sRunAsRootRule,
    K8sLatestTagRule
  ]);

  return engine;
}