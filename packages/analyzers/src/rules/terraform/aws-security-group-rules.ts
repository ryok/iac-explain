import { SecurityRule, RuleContext, RuleFinding } from '../../core/rule-engine.js';

class AwsSecurityGroupOpenAllRuleClass implements SecurityRule {
  id = 'TF_AWS_SG_OPEN_ALL';
  title = 'Security Group Open to All';
  description = 'Security group should not allow unrestricted access from 0.0.0.0/0';
  severity = 'crit' as const;
  category = 'security' as const;
  provider = 'aws';
  resourceTypes = ['aws_security_group', 'aws_security_group_rule'];
  references = [
    'https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html'
  ];

  evaluate(context: RuleContext): RuleFinding | null {
    const resource = context.resource;

    // Check ingress rules
    const ingressRules = resource.ingress || [];
    for (const rule of ingressRules) {
      if (this.isOpenToAll(rule)) {
        const dangerousPorts = this.checkDangerousPorts(rule);
        if (dangerousPorts.length > 0) {
          return {
            ruleId: this.id,
            severity: this.severity,
            title: this.title,
            description: 'Security group allows unrestricted access to sensitive ports',
            resource: {
              type: context.resourceType,
              name: context.resourceName,
              path: context.resourcePath
            },
            evidence: `Ingress rule allows 0.0.0.0/0 access to ports: ${dangerousPorts.join(', ')}`,
            recommendation: 'Restrict source CIDR blocks to specific IP ranges and limit port access',
            references: this.references
          };
        }
      }
    }

    // Check egress rules
    const egressRules = resource.egress || [];
    for (const rule of egressRules) {
      if (this.isOpenToAll(rule) && this.isWidePortRange(rule)) {
        return {
          ruleId: this.id,
          severity: 'high', // Lower severity for egress
          title: this.title,
          description: 'Security group allows unrestricted outbound access',
          resource: {
            type: context.resourceType,
            name: context.resourceName,
            path: context.resourcePath
          },
          evidence: 'Egress rule allows 0.0.0.0/0 access to all ports',
          recommendation: 'Limit outbound traffic to specific destinations and ports',
          references: this.references
        };
      }
    }

    return null;
  }

  private isOpenToAll(rule: any): boolean {
    return rule.cidr_blocks?.includes('0.0.0.0/0') ||
           rule.ipv6_cidr_blocks?.includes('::/0');
  }

  private checkDangerousPorts(rule: any): number[] {
    const dangerousPorts = [22, 3389, 1433, 3306, 5432, 6379, 27017];
    const fromPort = rule.from_port || 0;
    const toPort = rule.to_port || 65535;

    return dangerousPorts.filter(port => port >= fromPort && port <= toPort);
  }

  private isWidePortRange(rule: any): boolean {
    const fromPort = rule.from_port || 0;
    const toPort = rule.to_port || 65535;
    return fromPort === 0 && toPort === 65535;
  }
}

class AwsSecurityGroupSSHRuleClass implements SecurityRule {
  id = 'TF_AWS_SG_SSH_OPEN';
  title = 'SSH Access Open to Internet';
  description = 'Security group should not allow SSH access from 0.0.0.0/0';
  severity = 'crit' as const;
  category = 'security' as const;
  provider = 'aws';
  resourceTypes = ['aws_security_group', 'aws_security_group_rule'];

  evaluate(context: RuleContext): RuleFinding | null {
    const resource = context.resource;
    const ingressRules = resource.ingress || [];

    for (const rule of ingressRules) {
      if (rule.cidr_blocks?.includes('0.0.0.0/0') && this.allowsSSH(rule)) {
        return {
          ruleId: this.id,
          severity: this.severity,
          title: this.title,
          description: 'Security group allows SSH access from anywhere on the internet',
          resource: {
            type: context.resourceType,
            name: context.resourceName,
            path: context.resourcePath
          },
          evidence: `SSH port (22) is accessible from 0.0.0.0/0`,
          recommendation: 'Restrict SSH access to specific IP addresses or use AWS Systems Manager Session Manager',
          references: ['https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html']
        };
      }
    }

    return null;
  }

  private allowsSSH(rule: any): boolean {
    const fromPort = rule.from_port || 0;
    const toPort = rule.to_port || 65535;
    return fromPort <= 22 && toPort >= 22;
  }
}

export const AwsSecurityGroupOpenAllRule = new AwsSecurityGroupOpenAllRuleClass();
export const AwsSecurityGroupSSHRule = new AwsSecurityGroupSSHRuleClass();