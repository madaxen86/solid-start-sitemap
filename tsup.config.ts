import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  platform: 'node',
  format: 'esm',
  treeshake: true,
  dts: true,
  // plugins: [nodeExternalsPlugin()],
  external: ['vinxi', 'fs', 'path', 'stream', 'sitemap'],

  // array or single object
});
