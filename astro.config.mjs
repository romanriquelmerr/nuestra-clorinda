import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Reemplazar por el dominio real del medio
export default defineConfig({
  site: 'https://tudominio.com',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-light' }
  }
});
