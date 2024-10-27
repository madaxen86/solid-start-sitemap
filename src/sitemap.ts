import { createWriteStream } from 'fs';
import { resolve } from 'path';
import {
  EnumChangefreq,
  SitemapAndIndexStream,
  SitemapAndIndexStreamOptions,
  SitemapItemLoose,
  SitemapStream,
  SitemapStreamOptions,
  streamToPromise,
} from 'sitemap';
import { Readable } from 'stream';
import getRoutes from './getRoutes';

type Prettify<T extends Record<string, any>> = { [K in keyof T]: T[K] };

export type TReplaceDynamic = Record<string, Array<string | number>>;
// | Map<string, (item: SitemapItemLoose) => Array<string | number>>;

type TRoutes = {
  dynamicRoutes?: Array<SitemapItemLoose>;
  replaceRouteParams?: TReplaceDynamic;
};

type MultipleSitemapOptions = {
  limit: number;
  getSitemapStream?: SitemapAndIndexStreamOptions['getSitemapStream'];
} & Omit<SitemapAndIndexStreamOptions, 'getSitemapStream'>;

type SitemapOptions = { limit?: undefined } & SitemapStreamOptions;
type DefaultLinkOptions = {
  defaultLinkOptions?: Pick<SitemapItemLoose, 'changefreq' | 'priority' | 'lastmod'>;
};
export type Options = (MultipleSitemapOptions | SitemapOptions) &
  TRoutes &
  DefaultLinkOptions & { hostname: string; pubDir?: string; ignoreRoutes?: Array<string> };

/**
 * Generate a sitemap given a set of routes and options. The sitemap
 * is written to a file in the `pubDir` directory (or `public` by default).
 *
 * @param {Options} options Options from the sitemap.js for the `SitemapStream` or if limit is specified`SitemapAndIndexStream` classes
 * @param {string} [options.hostname] The hostname of your site.
 * @param {string} [options.pubDir] The directory to write the sitemap to.
 * @param {string[]} [options.ignoreRoutes] Routes to ignore in the format ['/posts/:id', '/posts/:id/edit','/*slug']
 * @param {SitemapItemLoose[]} [options.dynamicRoutes] Array of routes to include.
 *   Use this to include custom routes or as an alternative for dynamic routes by replaceRouteParams
 * @param {TReplaceDynamic} [options.replaceRouteParams] A map of dynamic
 *   route parameters to arrays of values to replace them with. e.g. {':postId': [1, 2, 3],':slug':["hello", "world"]}
 * @param {boolean} [options.limit] The maximum number of URLs to include in
 *   a single sitemap before splitting them to multiple files. If not specified, all routes will be included in a single sitemap.
 *   If specified, a index sitemap.xml file will be created referencing all the sitemap files.
 * @param {SitemapItemLoose} [options.defaultLinkOptions] Default options for
 *   each link in the sitemap.
 *
 * @returns {Promise<void>}
 * @example
 * createSitemap({
 *   hostname: 'https://example.com',
 *   pubDir: 'public',
 *   replaceRouteParams: {
 *     ':postId': [1, 2, 3],
 *   },
 *   limit: 5000,
 * })
 */
export async function createSitemap({
  dynamicRoutes,
  replaceRouteParams,
  defaultLinkOptions = {
    changefreq: EnumChangefreq.DAILY,
    priority: 0.5,
    lastmod: new Date().toISOString(),
  },
  hostname,
  pubDir = 'public',
  ignoreRoutes = [],
  ...options
}: Prettify<Options>) {
  //const output = new Map<string, string>();
  const routes = await getRoutes();

  const fileRoutes = routes.filter(
    r => r.page && !r.path.includes('/*') && !ignoreRoutes.includes(r.path),
  );
  console.log(
    routes.map(r => r.path),
    fileRoutes.map(r => r.path),
  );
  if (!fileRoutes && !dynamicRoutes) throw new Error('no routes or dynamic routes found');

  let smStream = getSitmapStream(
    options,
    hostname,
    pubDir,
    //  output
  );
  for (const route of fileRoutes) {
    const path = route.path.replace(/\(.*?\)/gi, '').replace(/\/\//gi, '/');

    if (isDynamic(path)) {
      //console.log('dynamic');
      if (replaceRouteParams) {
        const dynamicParams = path.split('/').filter(p => p.startsWith(':'));

        // For each dynamic param, find corresponding values from the map
        const paramValues = dynamicParams.map(param => {
          const replace = replaceRouteParams[param];
          if (!replace)
            throw new Error(
              "missing replace value for dynamic param '" +
                param +
                "'. Please add it to the 'replaceRouteParams' option.",
            );
          return replace;
        });

        // Generate all possible combinations of the values
        const combinations = cartesianProduct(paramValues);

        // Replace dynamic params with each combination to generate URLs and write to stream
        combinations.forEach(combination => {
          let newUrl = path;
          dynamicParams.forEach((param, index) => {
            newUrl = newUrl.replace(param, combination[index]);
          });

          smStream.write({ ...defaultLinkOptions, url: newUrl });
        });
      }
    } else {
      //static routes
      smStream.write({
        changefreq: defaultLinkOptions.changefreq,
        priority: path === '/' ? 1 : defaultLinkOptions.priority,
        url: path,
      });
    }
  }

  if (dynamicRoutes) {
    Readable.from(dynamicRoutes).pipe(smStream);
  }

  smStream.pipe(createWriteStream(resolve(`./${pubDir}/sitemap.xml`)));
  smStream.end();
  // const txt = await streamToPromise(smStream).then(data => {
  //   return data.toString();
  // });
  // output.set('index', txt);
  //writeFileSync('./public/sitemap.xml', txt, 'utf-8');
}

function getSitmapStream(
  options: SitemapOptions | MultipleSitemapOptions,
  hostname: string,
  pubDir: string,
  // output: Map<string, string>,
) {
  if (options.limit) {
    return new SitemapAndIndexStream({
      lastmodDateOnly: true,
      getSitemapStream: i => {
        const sitemapStream = new SitemapStream({ hostname });
        // if your server automatically serves sitemap.xml.gz when requesting sitemap.xml leave this line be
        // otherwise you will need to add .gz here and remove it a couple lines below so that both the index
        // and the actual file have a .gz extension
        const path = `./${pubDir}/sitemap-${i}.xml`;

        const ws = sitemapStream
          //.pipe(createGzip()) // compress the output of the sitemap
          .pipe(createWriteStream(resolve(path))); // write it to sitemap-NUMBER.xml

        //streamToPromise(sitemapStream).then(data => output.set(path, data.toString()));

        return [new URL(path, hostname).toString(), sitemapStream, ws];
      },
      ...options,
    });
  } else {
    return new SitemapStream({ hostname, ...options, lastmodDateOnly: true });
  }
}

function isDynamic(route: string) {
  return route.includes('/:') || route.includes('/*');
}

/**
 * Function to generate the cartesian product of an array of arrays
 * @param arrays - An array of arrays to combine
 * @returns - An array of all possible combinations
 */
function cartesianProduct(arrays: any[][]): any[][] {
  return arrays.reduce(
    (acc, curr) => {
      return acc.flatMap(a => curr.map(c => [...a, c]));
    },
    [[]],
  );
}
