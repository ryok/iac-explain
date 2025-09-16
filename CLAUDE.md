# iac-explain - Infrastructure as Code Analysis and Explanation Tool

## Project Overview

A comprehensive system to analyze Terraform plans and Helm/K8s manifests, converting them into human-readable explanations with risk assessment, drift detection, cost analysis, and automated security hardening suggestions.

### Key Objectives & KPIs

- **Review Time Reduction**: 50% decrease in IaC PR review time
- **Security**: 0 high-risk configuration deployments to main
- **Automation**: 95% auto-generation rate for "explainable diffs"
- **Adoption**: 30%+ acceptance rate for auto-hardening suggestions

### Initial Scope

- **Terraform**: HCL2 parsing, `terraform show -json` analysis (AWS/GCP/Azure)
- **Kubernetes**: Helm templates and raw YAML validation
- **Cost Analysis**: Infracost CLI integration
- **Policy-as-Code**: Rego/Conftest with built-in rules

## Architecture

```
GitHub Webhook/Action
  └─► iac-explain MCP Server (HTTP/stdio JSON-RPC)
       ├─ parsers: terraform-plan, helm, k8s
       ├─ analyzers: CIS/tfsec-like, k8s best practices
       ├─ policy-engine: Rego + org/repo policy
       ├─ patch-engine: HCL/K8s minimal fixes, PR suggestions
       ├─ cost-engine: infracost adapter
       ├─ drift-engine: plan -refresh-only diff
       └─ llm-adapter: explanation/summary generation
  └─► GitHub Checks/Reviews (Summary MD, Annotations, Suggested Changes)
  └─► Artifact Store (MD/HTML reports, SBOM-like)
```

**Deployment**: GitHub Actions (Docker) → Cloud Run/Azure Container Apps
**Permissions**: `contents:read`, `pull-requests:write`, `checks:write`

## MCP Tool APIs

### Core Functions

#### `explainPlan`
Analyzes Terraform plans and provides comprehensive summary.

**Input:**
```typescript
{
  workspace: string,               // Terraform workspace/directory
  planPath?: string,               // Existing plan file or JSON
  cloud?: "aws"|"gcp"|"azure",
  policySet?: string,              // .iac-explain.yml reference key
  depth?: "fast"|"full"
}
```

**Output:**
```typescript
{
  summary: string,                 // Natural language change summary
  adds: number, changes: number, destroys: number,
  resources: Array<{type:string, name:string, action:"create"|"update"|"delete", path:string}>,
  risks: Finding[],                // Rule ID/rationale/recommendations
  drift?: DriftReport,             // refresh-only results
  evidenceMd: string               // Evidence with links in MD format
}
```

#### `hardening`
Generates security hardening patches.

**Input:**
```typescript
{
  workspace: string,
  targets?: Array<{path:string, ruleId:string}> // Auto-detect if not specified
}
```

**Output:**
```typescript
{ patches: Patch[], notesMd: string }
```

#### `costDelta`
Calculates cost differences between branches.

**Input:**
```typescript
{
  workspace: string,
  baselineBranch?: string,         // Default: main
}
```

**Output:**
```typescript
{
  monthlyDeltaUsd?: number,
  breakdown?: Record<string, number>,
  reportMd: string
}
```

#### `validateK8s`
Validates Kubernetes manifests and Helm charts.

**Input:**
```typescript
{
  manifestsDir?: string,
  helmChart?: string,
  values?: string[]
}
```

**Output:**
```typescript
{
  findings: Finding[],
  suggestions: Patch[],
  reportMd: string
}
```

### Data Types

```typescript
type Finding = {
  ruleId: string;                  // ex: TF_AWS_S3_PUBLIC
  severity: "low"|"med"|"high"|"crit";
  resource?: {type:string, name:string, addr?:string};
  path?: string;                   // HCL/YAML path
  rationale: string;               // Why it's risky (evidence)
  recommendation: string;          // How to fix (approach)
  evidence?: string;               // Specific line/attribute/plan diff excerpt
};

type Patch = {
  file: string;
  unifiedDiff: string;
  preview?: string
};

type DriftReport = {
  changedResources: number;
  details: Array<{
    addr: string,
    field: string,
    before: any,
    after: any
  }>
};
```

## Repository Structure

```
iac-explain/
├─ packages/
│  ├─ mcp-server/            # JSON-RPC, tool registration
│  ├─ tf-parser/             # terraform show -json type-safe parsing
│  ├─ k8s-parser/            # helm template / YAML analysis
│  ├─ analyzers/             # Rule evaluation (Terraform/K8s)
│  ├─ policy-engine/         # Rego + .iac-explain.yml loader
│  ├─ patch-engine/          # HCL/YAML AST editing → unified diff
│  ├─ cost-engine/           # infracost CLI adapter
│  ├─ drift-engine/          # refresh-only diff
│  ├─ gh-adapter/            # Checks/Reviews/Artifacts
│  └─ llm-adapter/           # Explanation text formatting
├─ actions/iac-explain-action
├─ policies/                 # Rule definitions (Rego/JSON)
├─ examples/terraform-aws-s3-public/
└─ .github/workflows/iac-explain.yml
```

## Analysis Rules

### Terraform Rules (Examples)

**AWS:**
- `TF_AWS_S3_PUBLIC` (high): Missing `aws_s3_bucket_public_access_block` / `acl != private` / `block_public_acls=false`
- `TF_AWS_S3_NO_ENCRYPTION` (high): Missing `server_side_encryption_configuration` or `sse_algorithm != "aws:kms"`
- `TF_AWS_SG_OPEN_ALL` (crit): `0.0.0.0/0` with `from_port<=22||3389||*`

**Azure:**
- `TF_AZ_STG_TLS12` (high): `azurerm_storage_account` `min_tls_version < "TLS1_2"`
- `TF_AZ_PUBLIC_IP` (med): Public IP with overly permissive NSG rules
- `TF_AZ_HTTPS_ONLY` (high): `https_traffic_only=false`

**GCP:**
- `TF_GCP_BUCKET_PUBLIC` (high): `allUsers`/`allAuthenticatedUsers` permissions
- `TF_GCP_SQL_NO_BACKUP` (med): Auto backup disabled, `deletion_protection=false`
- `TF_GCP_FW_OPEN_ALL` (crit): `0.0.0.0/0` allowed

### Kubernetes Rules (Examples)

- `K8S_NO_LIMITS` (high): Missing `resources.limits/requests`
- `K8S_PRIV_ESC` (crit): `securityContext.allowPrivilegeEscalation=true`
- `K8S_RUN_AS_ROOT` (high): `runAsNonRoot!=true` / `readOnlyRootFilesystem!=true`
- `K8S_LATEST_TAG` (med): `image: *:latest`

## Policy Configuration

### `.iac-explain.yml`

```yaml
risk:
  critical_rules: [K8S_PRIV_ESC, TF_AWS_SG_OPEN_ALL]
  high_rules: [TF_AWS_S3_PUBLIC, TF_AZ_HTTPS_ONLY, TF_GCP_BUCKET_PUBLIC, K8S_NO_LIMITS]
review:
  ignore_paths:
    - "**/.terraform/**"
    - "**/examples/**"
  cloud: ["aws","azure","gcp"]
fix:
  auto_patch_labels: ["allow-auto-patch"]
  max_patches: 10
cost:
  enable: true
  baseline_branch: "main"
drift:
  enable: true
llm:
  provider: "azure_openai"
  model: "gpt-4o-mini"
  temperature: 0.1
```

## GitHub Actions Integration

### `.github/workflows/iac-explain.yml`

```yaml
name: iac-explain
on:
  pull_request:
    paths: ["**/*.tf", "**/*.tfvars", "**/Chart.yaml", "**/*.yaml", "**/*.yml"]
jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      checks: write
    steps:
      - uses: actions/checkout@v4
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
      - name: Setup Helm
        uses: azure/setup-helm@v4
      - name: Run iac-explain
        uses: iac-explain/action@v1
        with:
          mode: "explain+validate+cost"
          github_token: ${{ secrets.GITHUB_TOKEN }}
          infracost_api_key: ${{ secrets.INFRACOST_API_KEY }}
```

## Implementation Tasks

### Core Components
- [ ] `tf-parser`: `terraform show -json` → type definitions & unit tests
- [ ] `k8s-parser`: helm/yaml loading & path resolution (`containers[]`...)
- [ ] `policy-engine`: Rego execution & `.iac-explain.yml` merging
- [ ] `analyzers`: AWS/Azure/GCP/K8s top 10 rules implementation
- [ ] `patch-engine`: HCL/YAML AST rewriting → unified diff generation
- [ ] `cost-engine`: Infracost CLI adapter
- [ ] `drift-engine`: refresh-only diff extraction
- [ ] `gh-adapter`: Checks/Annotations/Review/Suggested Changes
- [ ] `mcp-server`: explainPlan / hardening / costDelta / validateK8s
- [ ] `Action`: Composite or JS action & cache optimization

### Documentation & Operations
- [ ] Docs: Setup guide, policy syntax, FAQ, runbook
- [ ] Observability: Structured logging & key metrics emission

## 90-Day Roadmap

### Days 0-30 (PoC)
- Terraform (AWS/GCP/Azure top 5 resources) + K8s basic rules
- Cost estimation + Check Run output

### Days 31-60 (Production)
- Minimal patch application (with label)
- Drift periodic checks
- Org policy distribution

### Days 61-90 (Enhancement)
- Monorepo optimization (diff plan / affected services)
- FinOps deep dive (RI/SP recommendation text)

## Security & Privacy

- Webhook signature verification, minimal permissions
- Analysis targets: diff & plan JSON only (no environment secrets)
- Generated logs: hashed summary + rule ID/counts only (14-30 day TTL)

## Monitoring & Metrics

**Technical SLI**: Analysis success rate, average analysis time, patch application success rate, false positive rate
**Business KPI**: Risk detection/remediation count, cumulative monthly cost difference
**Dashboard**: Logs + BigQuery/Log Analytics → Grafana

## Acceptance Criteria (Minimal PoC)

- [ ] Terraform plan input → addition/change/deletion counts + top 5 risks in MD
- [ ] `aws_s3_bucket` public risk detection → minimal patch (public access block addition)
- [ ] Helm chart `resources.limits` missing detection → YAML diff suggestion
- [ ] Infracost baseline comparison → cost estimate summary display
- [ ] `-refresh-only` drift → human-readable summary

## Development Environment Setup

```bash
# Clone repository
git clone https://github.com/your-org/iac-explain.git
cd iac-explain

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage Examples

### Basic Terraform Analysis
```bash
# Analyze current directory
claude-code explain-plan --workspace ./terraform/aws

# Analyze with specific policy
claude-code explain-plan --workspace ./terraform/aws --policy-set production
```

### Kubernetes Validation
```bash
# Validate Helm chart
claude-code validate-k8s --helm-chart ./charts/api

# Validate raw manifests
claude-code validate-k8s --manifests-dir ./k8s/
```

### Cost Analysis
```bash
# Compare against main branch
claude-code cost-delta --workspace ./terraform/aws --baseline-branch main
```

This system will provide comprehensive IaC analysis with automated security hardening, cost optimization, and drift detection while maintaining security best practices and providing clear, actionable insights for development teams.