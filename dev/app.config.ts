import { defineConfig } from '@solidjs/start/config';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
import Plugin from '../src/plugin';

const app = defineConfig({
  vite: {
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, '../src'),
        '@plugin': path.resolve(__dirname, '../src/plugin'),
      },
    },
    plugins: [
      Plugin({
        hostname: 'http://localhost:3000',
        replaceRouteParams: {
          ':slug': ['solid', 'solid-start', 'hello'],
          ':first': ['a', 'b', 'c'],
          ':second': ['1', '2', '3'],
          ':third': ['x', 'y'],
        },
        limit: 5000,
      }),
    ],
    optimizeDeps: {
      include: ['unenv'],
    },
  },
  server: {
    experimental: {
      openAPI: true,
    },
    alias: {
      consola: 'consola',
    },
  },
});

export default app;
