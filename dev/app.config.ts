import { defineConfig } from '@solidjs/start/config';
import siteMap from '../src/plugin';
export default defineConfig({
  vite: {
    plugins: [
      siteMap({
        hostname: 'http://localhost:3000',
        replaceRouteParams: {
          ':first': ['a', 'b', 'c'],
          ':second': ['1', '2', '3'],
          ':third': ['x', 'y'],
          ':slug': ['hello', 'world'],
        },
      }),
    ],
  },
});
