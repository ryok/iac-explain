# iac-explain

Infrastructure as Code (IaC) analysis and explanation tool with Model Context Protocol (MCP) support.

## Overview

`iac-explain` is a comprehensive tool that analyzes Terraform plans and Kubernetes manifests, providing:

- 🔍 **Security Analysis**: Detect misconfigurations and security risks
- 📊 **Cost Estimation**: Calculate infrastructure costs and changes
- 🛠️ **Auto-Fixing**: Generate patches for common security issues
- 📚 **Human-Readable Explanations**: Convert technical changes to natural language
- 🔄 **Drift Detection**: Identify differences between planned and actual state

## Features

### Supported Technologies

- **Terraform**: HCL analysis, plan JSON parsing (AWS, GCP, Azure)
- **Kubernetes**: YAML manifest validation, Helm chart analysis
- **Security Rules**: CIS benchmarks, industry best practices
- **Cost Analysis**: Integration with Infracost

### Key Capabilities

- **MCP Integration**: Works seamlessly with Claude and other MCP-compatible tools
- **CI/CD Integration**: GitHub Actions, GitLab CI, Azure DevOps
- **Policy as Code**: Customizable rules with Rego support
- **Automated Remediation**: Generate fix suggestions and patches

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/iac-explain.git
cd iac-explain

# Install dependencies
npm install

# Build the project
npm run build
```

### Basic Usage

#### Analyze Terraform Plan

```bash
# Generate and analyze a Terraform plan
terraform plan -out=tfplan.bin
terraform show -json tfplan.bin > tfplan.json

# Run analysis
npx iac-explain explain-plan --workspace ./terraform --plan-path tfplan.json
```

#### Validate Kubernetes Manifests

```bash
# Analyze Kubernetes YAML files
npx iac-explain validate-k8s --manifests-dir ./k8s

# Analyze Helm chart
npx iac-explain validate-k8s --helm-chart ./charts/myapp
```

#### Cost Analysis

```bash
# Compare costs against main branch
npx iac-explain cost-delta --workspace ./terraform --baseline-branch main
```

### MCP Server Usage

Start the MCP server for integration with Claude or other MCP clients:

```bash
# Start the server
npx iac-explain serve

# List available tools
npx iac-explain list-tools
```

## Configuration

Create a `.iac-explain.yml` file in your repository root:

```yaml
risk:
  critical_rules: [K8S_PRIV_ESC, TF_AWS_SG_OPEN_ALL]
  high_rules: [TF_AWS_S3_PUBLIC, K8S_NO_LIMITS]

review:
  ignore_paths:
    - "**/.terraform/**"
    - "**/examples/**"
  cloud: ["aws", "gcp", "azure"]

fix:
  auto_patch_labels: ["allow-auto-patch"]
  max_patches: 10

cost:
  enable: true
  baseline_branch: "main"

drift:
  enable: true
```

## Security Rules

### Terraform Rules

#### AWS
- **TF_AWS_S3_PUBLIC**: Detects public S3 buckets
- **TF_AWS_S3_NO_ENCRYPTION**: Missing S3 encryption
- **TF_AWS_SG_OPEN_ALL**: Overly permissive security groups
- **TF_AWS_SG_SSH_OPEN**: SSH access from 0.0.0.0/0

#### Azure
- **TF_AZ_STG_TLS12**: Weak TLS configuration
- **TF_AZ_HTTPS_ONLY**: HTTP traffic allowed

#### GCP
- **TF_GCP_BUCKET_PUBLIC**: Public GCS buckets
- **TF_GCP_FW_OPEN_ALL**: Permissive firewall rules

### Kubernetes Rules

- **K8S_NO_LIMITS**: Missing resource limits
- **K8S_PRIV_ESC**: Privilege escalation allowed
- **K8S_RUN_AS_ROOT**: Running as root user
- **K8S_LATEST_TAG**: Using :latest image tags

## CI/CD Integration

### GitHub Actions

Add the workflow file to `.github/workflows/iac-explain.yml`:

```yaml
name: IaC Security Analysis
on:
  pull_request:
    paths: ["**/*.tf", "**/*.yaml"]

jobs:
  security-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      # Analysis steps...
```

### Example Output

```markdown
# Infrastructure Analysis Report

## Summary
- **Additions**: 3 resources
- **Changes**: 1 resource
- **Deletions**: 0 resources

## Critical Issues (2)

### TF_AWS_SG_OPEN_ALL
**Resource**: aws_security_group.web
**Description**: Security group allows SSH access from 0.0.0.0/0
**Evidence**: Ingress rule allows 0.0.0.0/0 access to port 22
**Recommendation**: Restrict SSH access to specific IP ranges

### K8S_PRIV_ESC
**Resource**: Deployment/vulnerable-app
**Description**: Container allows privilege escalation
**Evidence**: allowPrivilegeEscalation: true in sidecar container
**Recommendation**: Set allowPrivilegeEscalation to false

## Cost Impact
- **Monthly Delta**: +$156/month
- **Primary Driver**: EC2 instances (2x t3.medium)
```

## Development

### Project Structure

```
iac-explain/
├── packages/
│   ├── mcp-server/         # MCP server implementation
│   ├── tf-parser/          # Terraform plan parser
│   ├── k8s-parser/         # Kubernetes manifest parser
│   ├── analyzers/          # Security rule engine
│   ├── policy-engine/      # Policy management
│   ├── patch-engine/       # Fix generation
│   └── cost-engine/        # Cost analysis
├── examples/               # Example configurations
├── policies/               # Rule definitions
└── .github/workflows/      # CI/CD workflows
```

### Adding New Rules

1. Create rule implementation:

```typescript
export const MyCustomRule: SecurityRule = {
  id: 'MY_CUSTOM_RULE',
  title: 'My Custom Security Rule',
  severity: 'high',
  category: 'security',
  resourceTypes: ['aws_instance'],

  evaluate(context: RuleContext): RuleFinding | null {
    // Rule logic here
    return null;
  }
};
```

2. Register the rule:

```typescript
import { createDefaultRuleEngine } from '@iac-explain/analyzers';

const engine = createDefaultRuleEngine();
engine.registerRule(MyCustomRule);
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific package tests
npm test -w packages/tf-parser

# Run with coverage
npm run test:coverage
```

## Roadmap

- [ ] **Enhanced Cloud Support**: Complete Azure and GCP rule coverage
- [ ] **Policy Engine**: Full Rego integration for custom rules
- [ ] **Patch Generation**: Automated fix application
- [ ] **Web Interface**: Browser-based analysis dashboard
- [ ] **IDE Extensions**: VS Code and JetBrains plugins
- [ ] **Enterprise Features**: SSO, audit logs, compliance reporting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build and test
npm run build
npm test

# Lint code
npm run lint
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📚 [Documentation](https://docs.iac-explain.com)
- 🐛 [Issue Tracker](https://github.com/your-org/iac-explain/issues)
- 💬 [Discussions](https://github.com/your-org/iac-explain/discussions)
- 📧 [Email Support](mailto:support@iac-explain.com)

---

**⚡ Secure your infrastructure before it reaches production!**