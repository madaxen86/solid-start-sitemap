import { createSitemap, getRoutes } from '@src';
import { isServer } from 'solid-js/web';
export async function GET() {
  isServer;
  const replaceRouteParams = {
    ':slug': ['solid', 'solid-start', 'hello'],
    ':first': ['a', 'b', 'c'],
    ':second': ['1', '2', '3'],
    ':third': ['x', 'y'],
  };
  try {
    const r = getRoutes(undefined, '/dev/app.config.ts');
    await createSitemap({
      hostname: 'http://localhost:3000',
      replaceRouteParams,
      // limit: 5,
      ingoreRoutes: ['/about'],
    });

    return new Response('created sitemap');
  } catch (e) {
    return new Response(e instanceof Error ? e.message : JSON.stringify(e), { status: 500 });
  }
  //console.log(sm);
}
