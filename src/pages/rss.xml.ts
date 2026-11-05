import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const noticias = (await getCollection('noticias', ({ data }) => !data.borrador))
    .sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf());

  return rss({
    title: 'Nuestra Clorinda',
    description: 'Portal de noticias de Clorinda, Formosa.',
    site: context.site!,
    items: noticias.map((n) => ({
      title: n.data.titulo,
      description: n.data.bajada,
      pubDate: n.data.fecha,
      link: `/noticias/${n.slug}/`,
      categories: [n.data.categoria],
    })),
    customData: `<language>es-AR</language>`,
  });
}
