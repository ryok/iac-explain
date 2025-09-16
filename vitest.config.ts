import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/*.test.ts', 'packages/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@iac-explain/mcp-server': new URL('./packages/mcp-server/src', import.meta.url).pathname,
      '@iac-explain/tf-parser': new URL('./packages/tf-parser/src', import.meta.url).pathname,
      '@iac-explain/k8s-parser': new URL('./packages/k8s-parser/src', import.meta.url).pathname,
      '@iac-explain/analyzers': new URL('./packages/analyzers/src', import.meta.url).pathname,
      '@iac-explain/policy-engine': new URL('./packages/policy-engine/src', import.meta.url).pathname,
      '@iac-explain/patch-engine': new URL('./packages/patch-engine/src', import.meta.url).pathname,
      '@iac-explain/cost-engine': new URL('./packages/cost-engine/src', import.meta.url).pathname,
      '@iac-explain/drift-engine': new URL('./packages/drift-engine/src', import.meta.url).pathname,
      '@iac-explain/gh-adapter': new URL('./packages/gh-adapter/src', import.meta.url).pathname,
      '@iac-explain/llm-adapter': new URL('./packages/llm-adapter/src', import.meta.url).pathname
    }
  }
});