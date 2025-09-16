import { ResourceInfo } from '../types/terraform.js';

export interface ResourceAnalysis {
  resource: ResourceInfo;
  securityConcerns: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export class ResourceAnalyzer {
  public analyzeResource(resource: ResourceInfo): ResourceAnalysis {
    const analysis: ResourceAnalysis = {
      resource,
      securityConcerns: [],
      recommendations: [],
      riskLevel: 'low'
    };

    // Analyze based on resource type and provider
    switch (resource.provider) {
      case 'aws':
        this.analyzeAwsResource(analysis);
        break;
      case 'google':
        this.analyzeGcpResource(analysis);
        break;
      case 'azurerm':
        this.analyzeAzureResource(analysis);
        break;
      default:
        this.analyzeGenericResource(analysis);
    }

    return analysis;
  }

  private analyzeAwsResource(analysis: ResourceAnalysis): void {
    const { resource } = analysis;

    switch (resource.type) {
      case 'aws_s3_bucket':
        this.analyzeS3Bucket(analysis);
        break;
      case 'aws_security_group':
      case 'aws_security_group_rule':
        this.analyzeSecurityGroup(analysis);
        break;
      case 'aws_instance':
        this.analyzeEc2Instance(analysis);
        break;
      case 'aws_db_instance':
        this.analyzeRdsInstance(analysis);
        break;
      default:
        break;
    }
  }

  private analyzeGcpResource(analysis: ResourceAnalysis): void {
    const { resource } = analysis;

    switch (resource.type) {
      case 'google_storage_bucket':
        this.analyzeGcsBucket(analysis);
        break;
      case 'google_compute_firewall':
        this.analyzeGcpFirewall(analysis);
        break;
      default:
        break;
    }
  }

  private analyzeAzureResource(analysis: ResourceAnalysis): void {
    const { resource } = analysis;

    switch (resource.type) {
      case 'azurerm_storage_account':
        this.analyzeAzureStorageAccount(analysis);
        break;
      case 'azurerm_network_security_group':
        this.analyzeAzureNsg(analysis);
        break;
      default:
        break;
    }
  }

  private analyzeGenericResource(analysis: ResourceAnalysis): void {
    // Generic analysis for unknown providers
    analysis.riskLevel = 'low';
  }

  private analyzeS3Bucket(analysis: ResourceAnalysis): void {
    const { resource } = analysis;
    const after = resource.after;

    if (!after) return;

    // Check for public access
    if (after.acl === 'public-read' || after.acl === 'public-read-write') {
      analysis.securityConcerns.push('S3 bucket has public ACL');
      analysis.recommendations.push('Use private ACL and configure public access block');
      analysis.riskLevel = 'high';
    }

    // Check for encryption
    if (!after.server_side_encryption_configuration) {
      analysis.securityConcerns.push('S3 bucket lacks server-side encryption');
      analysis.recommendations.push('Enable server-side encryption with KMS');
      if (analysis.riskLevel === 'low') {
        analysis.riskLevel = 'medium';
      }
    }

    // Check for versioning
    if (!after.versioning || !after.versioning[0]?.enabled) {
      analysis.securityConcerns.push('S3 bucket versioning is disabled');
      analysis.recommendations.push('Enable versioning for data protection');
    }
  }

  private analyzeSecurityGroup(analysis: ResourceAnalysis): void {
    const { resource } = analysis;
    const after = resource.after;

    if (!after) return;

    // Check for overly permissive rules
    const ingress = after.ingress || [];
    const egress = after.egress || [];

    for (const rule of [...ingress, ...egress]) {
      if (rule.cidr_blocks?.includes('0.0.0.0/0')) {
        // Check for dangerous ports
        const fromPort = rule.from_port || 0;
        const toPort = rule.to_port || 65535;

        if ((fromPort <= 22 && toPort >= 22) ||
            (fromPort <= 3389 && toPort >= 3389) ||
            (fromPort === 0 && toPort === 65535)) {
          analysis.securityConcerns.push('Security group allows unrestricted access to sensitive ports');
          analysis.recommendations.push('Restrict source IP ranges and limit port access');
          analysis.riskLevel = 'critical';
        }
      }
    }
  }

  private analyzeEc2Instance(analysis: ResourceAnalysis): void {
    const { resource } = analysis;
    const after = resource.after;

    if (!after) return;

    // Check for public IP
    if (after.associate_public_ip_address) {
      analysis.securityConcerns.push('EC2 instance has public IP address');
      analysis.recommendations.push('Use NAT Gateway or VPC endpoints instead of direct internet access');
      analysis.riskLevel = 'medium';
    }

    // Check for IMDSv2
    if (after.metadata_options?.[0]?.http_tokens !== 'required') {
      analysis.securityConcerns.push('EC2 instance does not require IMDSv2');
      analysis.recommendations.push('Enable IMDSv2 requirement for enhanced security');
      if (analysis.riskLevel === 'low') {
        analysis.riskLevel = 'medium';
      }
    }
  }

  private analyzeRdsInstance(analysis: ResourceAnalysis): void {
    const { resource } = analysis;
    const after = resource.after;

    if (!after) return;

    // Check for public accessibility
    if (after.publicly_accessible) {
      analysis.securityConcerns.push('RDS instance is publicly accessible');
      analysis.recommendations.push('Disable public accessibility and use VPC endpoints');
      analysis.riskLevel = 'high';
    }

    // Check for encryption
    if (!after.storage_encrypted) {
      analysis.securityConcerns.push('RDS instance storage is not encrypted');
      analysis.recommendations.push('Enable storage encryption');
      if (analysis.riskLevel === 'low') {
        analysis.riskLevel = 'medium';
      }
    }
  }

  private analyzeGcsBucket(analysis: ResourceAnalysis): void {
    const { resource } = analysis;
    const after = resource.after;

    if (!after) return;

    // Check IAM bindings
    const iamBinding = after.iam_binding || [];
    for (const binding of iamBinding) {
      if (binding.members?.includes('allUsers') || binding.members?.includes('allAuthenticatedUsers')) {
        analysis.securityConcerns.push('GCS bucket has public IAM bindings');
        analysis.recommendations.push('Remove public IAM bindings and use specific principals');
        analysis.riskLevel = 'high';
      }
    }
  }

  private analyzeGcpFirewall(analysis: ResourceAnalysis): void {
    const { resource } = analysis;
    const after = resource.after;

    if (!after) return;

    // Check for overly permissive rules
    if (after.source_ranges?.includes('0.0.0.0/0')) {
      analysis.securityConcerns.push('GCP firewall rule allows traffic from anywhere');
      analysis.recommendations.push('Restrict source ranges to specific IP blocks');
      analysis.riskLevel = 'high';
    }
  }

  private analyzeAzureStorageAccount(analysis: ResourceAnalysis): void {
    const { resource } = analysis;
    const after = resource.after;

    if (!after) return;

    // Check for TLS version
    if (after.min_tls_version !== 'TLS1_2') {
      analysis.securityConcerns.push('Azure Storage Account allows weak TLS versions');
      analysis.recommendations.push('Set minimum TLS version to TLS1_2');
      analysis.riskLevel = 'medium';
    }

    // Check for HTTPS-only traffic
    if (!after.https_traffic_only) {
      analysis.securityConcerns.push('Azure Storage Account allows HTTP traffic');
      analysis.recommendations.push('Enable HTTPS-only traffic');
      analysis.riskLevel = 'high';
    }
  }

  private analyzeAzureNsg(analysis: ResourceAnalysis): void {
    const { resource } = analysis;
    const after = resource.after;

    if (!after) return;

    const securityRules = after.security_rule || [];
    for (const rule of securityRules) {
      if (rule.source_address_prefix === '*' || rule.source_address_prefix === '0.0.0.0/0') {
        analysis.securityConcerns.push('Azure NSG rule allows traffic from any source');
        analysis.recommendations.push('Restrict source address prefixes');
        analysis.riskLevel = 'high';
      }
    }
  }
}