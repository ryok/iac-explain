import { z } from 'zod';

export const RuleSeveritySchema = z.enum(['low', 'med', 'high', 'crit']);
export type RuleSeverity = z.infer<typeof RuleSeveritySchema>;

export interface RuleFinding {
  ruleId: string;
  severity: RuleSeverity;
  title: string;
  description: string;
  resource?: {
    type: string;
    name: string;
    path?: string;
  };
  evidence?: string;
  recommendation: string;
  references?: string[];
}

export interface RuleContext<T = any> {
  resource: T;
  resourceType: string;
  resourceName: string;
  resourcePath?: string;
}

export interface SecurityRule<T = any> {
  id: string;
  title: string;
  description: string;
  severity: RuleSeverity;
  category: 'security' | 'compliance' | 'best-practice' | 'performance';
  provider?: string;
  resourceTypes: string[];
  references?: string[];

  evaluate(context: RuleContext<T>): RuleFinding | null;
}

export class RuleEngine {
  private rules: Map<string, SecurityRule> = new Map();

  public registerRule(rule: SecurityRule): void {
    this.rules.set(rule.id, rule);
  }

  public registerRules(rules: SecurityRule[]): void {
    for (const rule of rules) {
      this.registerRule(rule);
    }
  }

  public getRules(filters?: {
    provider?: string;
    resourceType?: string;
    severity?: RuleSeverity;
    category?: string;
  }): SecurityRule[] {
    const allRules = Array.from(this.rules.values());

    if (!filters) {
      return allRules;
    }

    return allRules.filter(rule => {
      if (filters.provider && rule.provider !== filters.provider) {
        return false;
      }
      if (filters.resourceType && !rule.resourceTypes.includes(filters.resourceType)) {
        return false;
      }
      if (filters.severity && rule.severity !== filters.severity) {
        return false;
      }
      if (filters.category && rule.category !== filters.category) {
        return false;
      }
      return true;
    });
  }

  public evaluateResource<T>(
    resource: T,
    resourceType: string,
    resourceName: string,
    resourcePath?: string
  ): RuleFinding[] {
    const findings: RuleFinding[] = [];
    const context: RuleContext<T> = {
      resource,
      resourceType,
      resourceName,
      resourcePath
    };

    const applicableRules = this.getRules({ resourceType });

    for (const rule of applicableRules) {
      try {
        const finding = rule.evaluate(context);
        if (finding) {
          findings.push(finding);
        }
      } catch (error) {
        console.warn(`Rule ${rule.id} evaluation failed:`, error);
      }
    }

    return findings;
  }

  public evaluateResources<T>(
    resources: Array<{ resource: T; type: string; name: string; path?: string }>
  ): RuleFinding[] {
    const allFindings: RuleFinding[] = [];

    for (const { resource, type, name, path } of resources) {
      const findings = this.evaluateResource(resource, type, name, path);
      allFindings.push(...findings);
    }

    return allFindings;
  }

  public getRule(ruleId: string): SecurityRule | undefined {
    return this.rules.get(ruleId);
  }

  public getRuleCount(): number {
    return this.rules.size;
  }
}