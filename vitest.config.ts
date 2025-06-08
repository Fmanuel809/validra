import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/core': resolve(__dirname, './src/core'),
      '@/dsl': resolve(__dirname, './src/dsl'),
      '@/operations': resolve(__dirname, './src/operations'),
      '@/utils': resolve(__dirname, './src/utils'),
    },
  },
  test: {
    environment: 'node',
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: ['node_modules', 'dist', 'docs'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,ts}'],
      exclude: [
        'src/**/*.{test,spec}.{js,ts}',
        'src/**/index.ts',
        'src/**/*.d.ts',
        'src/**/interfaces/*',
        'src/**/types/*',
        'src/**/*.types.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    reporters: ['verbose'],
    outputFile: {
      json: './test-output/test-results.json',
      html: './test-output/test-results.html',
    },
    globals: true,
    watch: false,
    passWithNoTests: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    setupFiles: [],
    typecheck: {
      checker: 'tsc',
      include: ['src/**/*.{test,spec}.ts'],
      exclude: ['node_modules'],
    },
  },
});
