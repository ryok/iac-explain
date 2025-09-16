import * as yaml from 'js-yaml';
import { K8sResource, K8sResourceSchema } from '../types/kubernetes.js';

export class ManifestParser {
  public parseYamlFile(yamlContent: string): K8sResource[] {
    const documents = yaml.loadAll(yamlContent);
    const resources: K8sResource[] = [];

    for (const doc of documents) {
      if (doc && typeof doc === 'object') {
        try {
          const resource = K8sResourceSchema.parse(doc);
          resources.push(resource);
        } catch (error) {
          console.warn('Failed to parse resource:', error);
        }
      }
    }

    return resources;
  }

  public parseJsonFile(jsonContent: string): K8sResource[] {
    try {
      const data = JSON.parse(jsonContent);

      if (Array.isArray(data)) {
        return data.map(item => K8sResourceSchema.parse(item));
      } else if (data && typeof data === 'object') {
        return [K8sResourceSchema.parse(data)];
      }

      return [];
    } catch (error) {
      console.warn('Failed to parse JSON resource:', error);
      return [];
    }
  }

  public filterByKind(resources: K8sResource[], kind: string): K8sResource[] {
    return resources.filter(resource => resource.kind === kind);
  }

  public filterByNamespace(resources: K8sResource[], namespace: string): K8sResource[] {
    return resources.filter(resource => resource.metadata.namespace === namespace);
  }

  public groupByKind(resources: K8sResource[]): Map<string, K8sResource[]> {
    const groups = new Map<string, K8sResource[]>();

    for (const resource of resources) {
      const kind = resource.kind;
      if (!groups.has(kind)) {
        groups.set(kind, []);
      }
      groups.get(kind)!.push(resource);
    }

    return groups;
  }

  public groupByNamespace(resources: K8sResource[]): Map<string, K8sResource[]> {
    const groups = new Map<string, K8sResource[]>();

    for (const resource of resources) {
      const namespace = resource.metadata.namespace || 'default';
      if (!groups.has(namespace)) {
        groups.set(namespace, []);
      }
      groups.get(namespace)!.push(resource);
    }

    return groups;
  }
}