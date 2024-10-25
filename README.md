<p>
  <img width='100%' src='https://assets.solidjs.com/banner?type=solid-start-sitemap&background=tiles&project=%20' alt='solid-start-sitemap'>
</p>

# solid-start-sitemap

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

This packages enables to build a sitemap of a solid-start-app.
Currently only file routes are available automatically.
The package will grab the route definitions from `vinxi/routes`.
Dynamic routes have are formatted like `/posts/:postId` or for the catch all routes `pages/*slug`.
This package is build on top of [sitemap.js](https://github.com/ekalinin/sitemap.js).

## Installation

```bash
npm i solid-start-sitemap
# or
yarn add solid-start-sitemap
# or
pnpm add solid-start-sitemap
```

## Usage

Generate a sitemap with one of the following options and add this entry to your `robots.txt` in the public directory

```
User-agent: *
Allow: /

###### add the following line ######
Sitemap: https://www.example.com/sitemap.xml

```

### Options

| PROP               | TYPE                              | EXAMPLE                                     | DESCRIPTION                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------ | --------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| hostname           | string                            | 'https://example.com'                       | Required: Basedomain of your app.                                                                                                                                                                                                                                                                                                                                                                                                    |
| pubDir             | string                            | 'public'                                    | Defaults to 'public'. Path to public directory where the public assets are stored and the XML(s) will be saved to. The plugin will get this automatically from the app config.                                                                                                                                                                                                                                                       |
| ingoreRoutes       | string[]                          | ['/posts/archive','/posts/archive/:postId'] | array of routes which should be excluded from the                                                                                                                                                                                                                                                                                                                                                                                    |
| replaceRouteParams | Record<string,(number\|string)[]> | {':postId':[1,2,3]}                         | Object which provides all params for the dynamic routes. Note that the params should have a unique name. So instead of `/posts/[id]` and `/products/[id]` you may rename them to `/posts/[postId]` and `/products/[productId]` or you may use the option `dynamicRoutes`. If you don't pass any params all dynamic routes will be ignored. Otherwise provide all params for dynamic routes which are not ignored with `ingoreRoutes` |
| dynamicRoutes      | string[]                          | ['posts/1','/posts/2','/posts/3']           | array of custom routes to add to the sitemap. Can be used to add dynamic routes for more complex use cases                                                                                                                                                                                                                                                                                                                           |
| limit              | number                            | 45000                                       | Maximum number if urls in one sitemap. If provided will generate multiple XML(s) and also create a index sitemap which references all sitemap files.                                                                                                                                                                                                                                                                                 |

### Generate a static sitemap during build

For a static site with static routes or dynamic routes with fixed amount of params add the plugin to the `app.config.ts`.
It will add a `sitemap.xml` or if you pass

```tsx
//app.config.ts
import { defineConfig } from '@solidjs/start/config';
import { SolidStartSiteMapPlugin } from 'solid-start-sitemap';

export default defineConfig({
  vite: {
    plugins: [
      SolidStartSiteMapPlugin({
        hostname: 'https://example.com',
        replaceRouteParams: {
          ':postId': [1, 2, 3],
        },
        limit: 5000,
      }),
    ],
  },
});
```

### Generate dynamic sitemap

The most common use case will probably be to create a sitemap dynamically either periodically (e.g. every day / every sunday, ...) or based on changes of data (e.g. new post).
Here are a few examples how to achieve this.

Add an API route which generates a new sitemap when you call it.
You can use a cronjob to re-generate periodically or if using a cms you can also use a webbhook as a trigger e.g. every time a new post is published.

```ts
// FIRST we'll create a reusable function

// ./src/lib/sitemap.ts
import { createSitemap } from 'solid-start-sitemap';
import { isServer } from 'solid-js/web';

export const generateSitemap = async () => {
  if (!isServer) throw new Error("This function may only be called on the server");
   //fetch all postIDs from DB / cms
  const postsIDs = await getPostIDs();

  await createSitemap({
   hostname:'https://example.com'
      replaceRouteParams: {
            ':postId': postIDs,
          },
          limit: 5000,
  });
}

//Now we can call this e.g. every time a new post is created
// ./src/queries/posts/create.tsx
import { generateSitemap } from  '~/lib/sitemap';

export async function createPost(data) {
  try {
    await db.create("post", data)
  } catch (err) {
      //handle error
  }
  generateSitemap().catch() //no need to await it - ignore errors
}

// or create an API which can be called periodically by a cronjob or by a webbhok if you use a cms.
// ./src/routes/api/sitemap.ts
import { generateSitemap } from  '~/lib/sitemap';

export async function GET() {
  //protect the route e.g.
  const token = await getAuthToken()
  if (!token || token !== process.env.SITEMAP_TOKEN) return new Response('Not Authorized',{status:401})

  try {
    await generateSitemap()
    return new Response('Sitemap generated successfully')
  } catch (err) {
    console.log(err);
    return  new Response(e instanceof Error ? e.message : JSON.stringify(e), { status: 500 });
  }

}
```
