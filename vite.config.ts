import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [TanStackRouterVite({ routesDirectory: 'src/routes' }), react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
});
