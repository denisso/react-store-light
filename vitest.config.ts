import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 0 for debug
    testTimeout: 0,
    include: ['__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['verbose'],
    environment: 'jsdom',
    setupFiles: './setup-tests.ts',
  },
});
