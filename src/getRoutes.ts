import { ResolvedConfig } from 'vite';
import { getManifest } from 'vinxi/manifest';
type VinxiFileRoute = { path: string; page: boolean; filePath: string };

export async function getRoutes(config?: ResolvedConfig): Promise<VinxiFileRoute[]> {
  if (config) {
    const router = config.router.internals.routes;
    if (!router) return [];
    const fileroutes = (await router.getRoutes()) satisfies VinxiFileRoute[];
    if (!fileroutes) return [];
    return fileroutes;
  } else {
    return (await getManifest('client').routes()) as unknown as VinxiFileRoute[];
  }
}

export default getRoutes;
