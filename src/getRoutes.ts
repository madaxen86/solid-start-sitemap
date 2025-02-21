import { App } from 'vinxi';
import { ResolvedConfig } from 'vite';
type VinxiFileRoute = { path: string; page: boolean; filePath: string };

export async function getRoutes(): Promise<VinxiFileRoute[]> {
  const app = (globalThis as any).app as App; //app added by vinxi
  const router = app.getRouter('client').internals.routes;

  if (!router) throw new Error('Could not get router from vinxi app');
  const fileroutes = (await router.getRoutes()) satisfies VinxiFileRoute[];
  if (!fileroutes) throw new Error('Could not get router from vinxi app');
  const cleanedRoutes = fileroutes
    .filter(
      route =>
        // (route.page || route.path.startsWith('/api')) &&
        !isLayout(route.path, route.filePath, fileroutes),
    )
    .map(({ path, ...r }) => ({ ...r, path: cleanPath(path) }))
    .sort((a, b) => a.length - b.length);
  return cleanedRoutes;
}

export default getRoutes;

function cleanPath(path: string) {
  return (
    path
      .replace(/\(.*?\)/gi, '')
      // remove double slashes
      .replace(/\/\//gi, '/')
      // remove trailing slash
      .replace(/\/$/gi, '')
  );
}

function isValidFile(path: string, routeRootPath: string) {
  return (
    path.includes(routeRootPath) &&
    !path.endsWith('RouteManifest/index.js') &&
    !path.endsWith('RouteManifest/index.d.ts') &&
    path.match(/\.[tj]sx?$/gi)
  );
}

function isLayout(route: string, filePath: string, allRoutes: VinxiFileRoute[]): boolean {
  // Check if any route in allRoutes starts with route + "/"
  return allRoutes.some(r => r.path.startsWith(route + '/') && r.filePath !== filePath);
}
