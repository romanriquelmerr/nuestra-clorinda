import { defineCollection, z } from 'astro:content';

const noticias = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    titulo: z.string(),
    bajada: z.string(),
    // Las imágenes viven junto a cada noticia (src/content/noticias/). Decap puede
    // guardar solo el nombre del archivo: se le antepone "./" para que Astro lo resuelva.
    imagen: z.preprocess(
      (v) => (typeof v === 'string' && !/^(\.|\/|~)/.test(v) ? `./${v}` : v),
      image(),
    ),
    categoria: z.enum([
      'politica', 'sociedad', 'policiales',
      'deportes', 'economia', 'cultura', 'region'
    ]),
    fecha: z.coerce.date(),
    autor: z.string().default('Redacción'),
    epigrafe: z.string().optional(),
    destacada: z.boolean().default(false),
    ultimaHora: z.boolean().default(false),
    borrador: z.boolean().default(false),
    etiquetas: z.array(z.string()).default([]),
  }),
});

export const collections = { noticias };
