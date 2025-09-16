#!/usr/bin/env node

import { Command } from 'commander';
import { IacExplainServer } from './server.js';

const program = new Command();

program
  .name('iac-explain')
  .description('Infrastructure as Code analysis and explanation tool')
  .version('0.1.0');

program
  .command('serve')
  .description('Start the MCP server')
  .action(async () => {
    try {
      const server = new IacExplainServer();
      console.error('Starting iac-explain MCP server...');
      await server.start();
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  });

program
  .command('list-tools')
  .description('List available tools')
  .action(() => {
    const server = new IacExplainServer();
    const tools = server.listTools();

    console.log('Available tools:');
    tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });
  });

program.parse();