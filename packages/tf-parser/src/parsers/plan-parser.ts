import { TerraformPlan, TerraformPlanSchema, PlanSummary, ResourceInfo } from '../types/terraform.js';

export class TerraformPlanParser {
  private plan: TerraformPlan;

  constructor(planJson: unknown) {
    this.plan = TerraformPlanSchema.parse(planJson);
  }

  public getSummary(): PlanSummary {
    const summary = {
      adds: 0,
      changes: 0,
      destroys: 0,
      totalResources: this.plan.resource_changes.length
    };

    for (const change of this.plan.resource_changes) {
      const actions = change.change.actions;

      if (actions.includes('create')) {
        summary.adds++;
      } else if (actions.includes('delete')) {
        summary.destroys++;
      } else if (actions.includes('update')) {
        summary.changes++;
      }
    }

    return summary;
  }

  public getResourceChanges(): ResourceInfo[] {
    return this.plan.resource_changes.map(change => {
      const primaryAction = this.getPrimaryAction(change.change.actions);

      return {
        address: change.address,
        type: change.type,
        name: change.name,
        provider: change.provider_name,
        action: primaryAction,
        before: change.change.before as Record<string, any> | null,
        after: change.change.after as Record<string, any> | null
      };
    });
  }

  public getResourcesByAction(action: 'create' | 'update' | 'delete'): ResourceInfo[] {
    return this.getResourceChanges().filter(resource => resource.action === action);
  }

  public getResourcesByType(type: string): ResourceInfo[] {
    return this.getResourceChanges().filter(resource => resource.type === type);
  }

  public getResourcesByProvider(provider: string): ResourceInfo[] {
    return this.getResourceChanges().filter(resource => resource.provider === provider);
  }

  public getTerraformVersion(): string {
    return this.plan.terraform_version;
  }

  public getRawPlan(): TerraformPlan {
    return this.plan;
  }

  private getPrimaryAction(actions: string[]): 'create' | 'update' | 'delete' | 'no-op' {
    if (actions.includes('create')) return 'create';
    if (actions.includes('delete')) return 'delete';
    if (actions.includes('update')) return 'update';
    return 'no-op';
  }
}

export function parseTerraformPlan(planJson: unknown): TerraformPlanParser {
  return new TerraformPlanParser(planJson);
}