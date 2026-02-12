import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // for debug
    testTimeout: 0,
    include: ['__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['verbose'],
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
