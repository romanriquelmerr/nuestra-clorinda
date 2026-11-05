import type { APIContext } from 'astro';

export function GET(context: APIContext) {
  return new Response(
    `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${new URL('sitemap-index.xml', context.site).href}
`,
    { headers: { 'Content-Type': 'text/plain' } }
  );
}
