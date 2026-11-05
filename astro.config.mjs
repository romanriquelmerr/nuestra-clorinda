import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Reemplazar por el dominio real del medio
export default defineConfig({
  site: 'https://nuestra-clorinda.pages.dev',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-light' }
  }
});
