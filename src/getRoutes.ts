import { App } from 'vinxi';
import { ResolvedConfig } from 'vite';
type VinxiFileRoute = { path: string; page: boolean; filePath: string };

export async function getRoutes(config?: ResolvedConfig, path?: string): Promise<VinxiFileRoute[]> {
  let router;
  if (config) {
    router = config.router.internals.routes;
  } else {
    const app = (globalThis as any).app as App; //app added by vinxi
    router = app.getRouter('client').internals.routes;
  }
  if (!router) throw new Error('Could not get router from vinxi app');
  const fileroutes = (await router.getRoutes()) satisfies VinxiFileRoute[];
  if (!fileroutes) throw new Error('Could not get router from vinxi app');
  return fileroutes;
}

export default getRoutes;
