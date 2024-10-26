import { ResolvedConfig } from 'vite';
import routes from 'vinxi/routes';
type VinxiFileRoute = { path: string; page: boolean; filePath: string };

export async function getRoutes(config?: ResolvedConfig): Promise<VinxiFileRoute[]> {
  if (config) {
    const router = config.router.internals.routes;
    if (!router) return [];
    const fileroutes = (await router.getRoutes()) satisfies VinxiFileRoute[];
    if (!fileroutes) return [];
    return fileroutes;
  } else {
    // const fileRoutes = (await import('vinxi/routes')).default as VinxiFileRoute[];
    return routes as VinxiFileRoute[];
  }
}

export default getRoutes;
