import { z } from 'zod';

export const K8sResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z.object({
    name: z.string(),
    namespace: z.string().optional(),
    labels: z.record(z.string()).optional(),
    annotations: z.record(z.string()).optional()
  }),
  spec: z.record(z.any()).optional(),
  status: z.record(z.any()).optional()
});
export type K8sResource = z.infer<typeof K8sResourceSchema>;

export const ContainerSchema = z.object({
  name: z.string(),
  image: z.string(),
  ports: z.array(z.object({
    containerPort: z.number(),
    protocol: z.string().optional(),
    name: z.string().optional()
  })).optional(),
  resources: z.object({
    limits: z.record(z.string()).optional(),
    requests: z.record(z.string()).optional()
  }).optional(),
  securityContext: z.object({
    allowPrivilegeEscalation: z.boolean().optional(),
    capabilities: z.object({
      add: z.array(z.string()).optional(),
      drop: z.array(z.string()).optional()
    }).optional(),
    privileged: z.boolean().optional(),
    readOnlyRootFilesystem: z.boolean().optional(),
    runAsNonRoot: z.boolean().optional(),
    runAsUser: z.number().optional(),
    runAsGroup: z.number().optional()
  }).optional(),
  env: z.array(z.object({
    name: z.string(),
    value: z.string().optional(),
    valueFrom: z.record(z.any()).optional()
  })).optional()
});
export type Container = z.infer<typeof ContainerSchema>;

export const PodSpecSchema = z.object({
  containers: z.array(ContainerSchema),
  initContainers: z.array(ContainerSchema).optional(),
  securityContext: z.object({
    runAsNonRoot: z.boolean().optional(),
    runAsUser: z.number().optional(),
    runAsGroup: z.number().optional(),
    fsGroup: z.number().optional(),
    supplementalGroups: z.array(z.number()).optional()
  }).optional(),
  serviceAccountName: z.string().optional(),
  automountServiceAccountToken: z.boolean().optional()
});
export type PodSpec = z.infer<typeof PodSpecSchema>;

export const DeploymentSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal('Deployment'),
  metadata: z.object({
    name: z.string(),
    namespace: z.string().optional(),
    labels: z.record(z.string()).optional()
  }),
  spec: z.object({
    replicas: z.number().optional(),
    selector: z.object({
      matchLabels: z.record(z.string())
    }),
    template: z.object({
      metadata: z.object({
        labels: z.record(z.string()).optional()
      }),
      spec: PodSpecSchema
    })
  })
});
export type Deployment = z.infer<typeof DeploymentSchema>;

export const ServiceSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal('Service'),
  metadata: z.object({
    name: z.string(),
    namespace: z.string().optional()
  }),
  spec: z.object({
    type: z.enum(['ClusterIP', 'NodePort', 'LoadBalancer', 'ExternalName']).optional(),
    ports: z.array(z.object({
      port: z.number(),
      targetPort: z.union([z.number(), z.string()]).optional(),
      protocol: z.string().optional(),
      nodePort: z.number().optional()
    })).optional(),
    selector: z.record(z.string()).optional()
  })
});
export type Service = z.infer<typeof ServiceSchema>;

export interface K8sAnalysisContext {
  resources: K8sResource[];
  namespace?: string;
  clusterInfo?: {
    version: string;
    provider?: string;
  };
}