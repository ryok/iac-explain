import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import {
  explainPlanTool,
  hardeningTool,
  costDeltaTool,
  validateK8sTool,
  handleExplainPlan,
  handleHardening,
  handleCostDelta,
  handleValidateK8s
} from './tools/index.js';

export class IacExplainServer {
  private server: Server;

  constructor() {
    this.server = new Server({
      name: 'iac-explain',
      version: '0.1.0'
    });

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'explainPlan':
            const explainResult = await handleExplainPlan(args);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(explainResult, null, 2)
              }]
            };

          case 'hardening':
            const hardeningResult = await handleHardening(args);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(hardeningResult, null, 2)
              }]
            };

          case 'costDelta':
            const costResult = await handleCostDelta(args);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(costResult, null, 2)
              }]
            };

          case 'validateK8s':
            const k8sResult = await handleValidateK8s(args);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(k8sResult, null, 2)
              }]
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{
            type: 'text',
            text: `Error: ${errorMessage}`
          }],
          isError: true
        };
      }
    });
  }

  public async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Register tools
    await this.server.notification({
      method: 'notifications/tools/list_changed',
      params: {}
    });
  }

  public listTools() {
    return [
      explainPlanTool,
      hardeningTool,
      costDeltaTool,
      validateK8sTool
    ];
  }
}