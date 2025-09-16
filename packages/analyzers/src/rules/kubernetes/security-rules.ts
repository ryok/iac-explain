import { SecurityRule, RuleContext, RuleFinding } from '../../core/rule-engine.js';
import { K8sResource } from '../../types/kubernetes.js';

class K8sNoLimitsRuleClass implements SecurityRule<K8sResource> {
  id = 'K8S_NO_LIMITS';
  title = 'Missing Resource Limits';
  description = 'Containers should have resource limits defined';
  severity = 'high' as const;
  category = 'best-practice' as const;
  resourceTypes = ['Deployment', 'Pod', 'StatefulSet', 'DaemonSet'];

  evaluate(context: RuleContext<K8sResource>): RuleFinding | null {
    const resource = context.resource;

    const containers = this.extractContainers(resource);
    const containersWithoutLimits: string[] = [];

    for (const container of containers) {
      if (!container.resources?.limits) {
        containersWithoutLimits.push(container.name);
      }
    }

    if (containersWithoutLimits.length > 0) {
      return {
        ruleId: this.id,
        severity: this.severity,
        title: this.title,
        description: 'Containers are missing resource limits',
        resource: {
          type: context.resourceType,
          name: context.resourceName,
          path: context.resourcePath
        },
        evidence: `Containers without limits: ${containersWithoutLimits.join(', ')}`,
        recommendation: 'Add resource limits (CPU and memory) to prevent resource exhaustion',
        references: ['https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/']
      };
    }

    return null;
  }

  private extractContainers(resource: K8sResource): any[] {
    switch (resource.kind) {
      case 'Pod':
        return resource.spec?.containers || [];
      case 'Deployment':
      case 'StatefulSet':
      case 'DaemonSet':
        return resource.spec?.template?.spec?.containers || [];
      default:
        return [];
    }
  }
}

class K8sPrivilegeEscalationRuleClass implements SecurityRule<K8sResource> {
  id = 'K8S_PRIV_ESC';
  title = 'Privilege Escalation Allowed';
  description = 'Containers should not allow privilege escalation';
  severity = 'crit' as const;
  category = 'security' as const;
  resourceTypes = ['Deployment', 'Pod', 'StatefulSet', 'DaemonSet'];

  evaluate(context: RuleContext<K8sResource>): RuleFinding | null {
    const resource = context.resource;
    const containers = this.extractContainers(resource);
    const vulnerableContainers: string[] = [];

    for (const container of containers) {
      if (container.securityContext?.allowPrivilegeEscalation === true) {
        vulnerableContainers.push(container.name);
      }
    }

    if (vulnerableContainers.length > 0) {
      return {
        ruleId: this.id,
        severity: this.severity,
        title: this.title,
        description: 'Containers allow privilege escalation',
        resource: {
          type: context.resourceType,
          name: context.resourceName,
          path: context.resourcePath
        },
        evidence: `Containers with allowPrivilegeEscalation: ${vulnerableContainers.join(', ')}`,
        recommendation: 'Set allowPrivilegeEscalation to false in securityContext',
        references: ['https://kubernetes.io/docs/concepts/security/pod-security-standards/']
      };
    }

    return null;
  }

  private extractContainers(resource: K8sResource): any[] {
    switch (resource.kind) {
      case 'Pod':
        return resource.spec?.containers || [];
      case 'Deployment':
      case 'StatefulSet':
      case 'DaemonSet':
        return resource.spec?.template?.spec?.containers || [];
      default:
        return [];
    }
  }
}

class K8sRunAsRootRuleClass implements SecurityRule<K8sResource> {
  id = 'K8S_RUN_AS_ROOT';
  title = 'Running as Root';
  description = 'Containers should not run as root user';
  severity = 'high' as const;
  category = 'security' as const;
  resourceTypes = ['Deployment', 'Pod', 'StatefulSet', 'DaemonSet'];

  evaluate(context: RuleContext<K8sResource>): RuleFinding | null {
    const resource = context.resource;
    const containers = this.extractContainers(resource);
    const rootContainers: string[] = [];

    const podSecurityContext = this.getPodSecurityContext(resource);
    const podRunAsNonRoot = podSecurityContext?.runAsNonRoot;

    for (const container of containers) {
      const containerSecurityContext = container.securityContext;
      const runAsNonRoot = containerSecurityContext?.runAsNonRoot ?? podRunAsNonRoot;

      if (runAsNonRoot !== true) {
        rootContainers.push(container.name);
      }
    }

    if (rootContainers.length > 0) {
      return {
        ruleId: this.id,
        severity: this.severity,
        title: this.title,
        description: 'Containers may be running as root user',
        resource: {
          type: context.resourceType,
          name: context.resourceName,
          path: context.resourcePath
        },
        evidence: `Containers without runAsNonRoot=true: ${rootContainers.join(', ')}`,
        recommendation: 'Set runAsNonRoot to true in securityContext or specify a non-root runAsUser',
        references: ['https://kubernetes.io/docs/concepts/security/pod-security-standards/']
      };
    }

    return null;
  }

  private extractContainers(resource: K8sResource): any[] {
    switch (resource.kind) {
      case 'Pod':
        return resource.spec?.containers || [];
      case 'Deployment':
      case 'StatefulSet':
      case 'DaemonSet':
        return resource.spec?.template?.spec?.containers || [];
      default:
        return [];
    }
  }

  private getPodSecurityContext(resource: K8sResource): any {
    switch (resource.kind) {
      case 'Pod':
        return resource.spec?.securityContext;
      case 'Deployment':
      case 'StatefulSet':
      case 'DaemonSet':
        return resource.spec?.template?.spec?.securityContext;
      default:
        return null;
    }
  }
}

class K8sLatestTagRuleClass implements SecurityRule<K8sResource> {
  id = 'K8S_LATEST_TAG';
  title = 'Using Latest Image Tag';
  description = 'Containers should not use :latest tag';
  severity = 'med' as const;
  category = 'best-practice' as const;
  resourceTypes = ['Deployment', 'Pod', 'StatefulSet', 'DaemonSet'];

  evaluate(context: RuleContext<K8sResource>): RuleFinding | null {
    const resource = context.resource;
    const containers = this.extractContainers(resource);
    const latestContainers: string[] = [];

    for (const container of containers) {
      if (container.image?.endsWith(':latest') || !container.image?.includes(':')) {
        latestContainers.push(container.name);
      }
    }

    if (latestContainers.length > 0) {
      return {
        ruleId: this.id,
        severity: this.severity,
        title: this.title,
        description: 'Containers are using :latest or untagged images',
        resource: {
          type: context.resourceType,
          name: context.resourceName,
          path: context.resourcePath
        },
        evidence: `Containers with :latest tag: ${latestContainers.join(', ')}`,
        recommendation: 'Use specific version tags for better reproducibility and security',
        references: ['https://kubernetes.io/docs/concepts/containers/images/#image-names']
      };
    }

    return null;
  }

  private extractContainers(resource: K8sResource): any[] {
    switch (resource.kind) {
      case 'Pod':
        return resource.spec?.containers || [];
      case 'Deployment':
      case 'StatefulSet':
      case 'DaemonSet':
        return resource.spec?.template?.spec?.containers || [];
      default:
        return [];
    }
  }
}

export const K8sNoLimitsRule = new K8sNoLimitsRuleClass();
export const K8sPrivilegeEscalationRule = new K8sPrivilegeEscalationRuleClass();
export const K8sRunAsRootRule = new K8sRunAsRootRuleClass();
export const K8sLatestTagRule = new K8sLatestTagRuleClass();