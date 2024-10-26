import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  platform: 'node',
  format: 'esm',
  treeshake: true,
  // plugins: [nodeExternalsPlugin()],
  external: ['vinxi/routes', 'fs', 'path', 'stream','sitemap'],

  // array or single object
});
