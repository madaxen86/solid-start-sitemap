import { Plugin } from 'vinxi';
import { createSitemap, Options } from './sitemap';

/**
 * SolidStart plugin to generate a static sitemap during build.
 *
 * @param {Options} options - Options to pass to `createSitemap`.
 * @returns {Plugin} A plugin instance.
 *
 * @example
 * import { defineConfig } from '@solidjs/start/config';
 * import SolidStartSiteMapPlugin from 'solid-start-sitemap';
 *
 * export default defineConfig({
 *   vite: {
 *     plugins: [
 *      SolidStartSiteMapPlugin({
 *       hostname: 'https://example.com',
 *       replaceRouteParams: {
 *         ':postId': [1, 2, 3],
 *       },
 *       limit: 5000,
 *     }),
 *     ],
 *   },
 * });
 */
export default function SolidStartSiteMapPlugin(options: Options): Plugin {
  return {
    name: 'solid-start-sitemap',
    apply: 'build',
    enforce: 'post',
    async configResolved(config) {
      // create sitemap only once - client router will always be build
      if (config.router.name === 'client') {
        console.log('pubdir', config.publicDir);
        await createSitemap({ ...options, pubDir: config.publicDir || 'public' });
      }
    },
  } as Plugin;
}
