# Nuestra Clorinda — Portal de noticias

Portal de noticias local construido con **Astro** (sitio estático), **Decap CMS**
(administración de contenido) y desplegado en **Cloudflare Pages**.

## Stack

- Astro 4 (output estático, TypeScript estricto)
- Content Collections de Astro (validación Zod de cada noticia)
- Decap CMS en `/admin` con autenticación GitHub OAuth
- Cloudflare Worker como proxy OAuth
- Sitemap automático, RSS y robots.txt

## Requisitos

- Node.js 18+
- Cuenta de GitHub (para el CMS)
- Cuenta de Cloudflare (para Pages y el Worker OAuth)

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:4321
```

### Panel de administración en local

Decap CMS en local usa un backend proxy, sin GitHub:

```bash
npx decap-server   # en una segunda terminal, desde la raíz
```

Luego entrar a `http://localhost:4321/admin` (el CMS usa `local_backend`,
ver `public/admin/config.yml`: descomentar `local_backend: true` y comentar
el bloque `backend` para el modo local).

Los cambios guardados en local se escriben directamente en los archivos
Markdown de `src/content/noticias/`.

## Contenido

Las imágenes se guardan junto a cada noticia (`src/content/noticias/`) y el CMS las referencia como `./archivo.jpg`. Los nombres de categoría para mostrar están en `src/lib/categorias.ts`; las fechas se formatean en hora de Formosa (`src/lib/fechas.ts`).

Cada noticia es un archivo Markdown en `src/content/noticias/` con frontmatter
validado por `src/content/config.ts`:

| Campo        | Tipo    | Obligatorio |
|--------------|---------|-------------|
| titulo       | string  | sí          |
| bajada       | text    | sí          |
| imagen       | image   | sí          |
| categoria    | select  | sí          |
| fecha        | date    | sí          |
| autor        | string  | no          |
| epigrafe     | string  | no          |
| destacada    | boolean | no          |
| ultimaHora   | boolean | no          |
| borrador     | boolean | no          |
| etiquetas    | list    | no          |

- `borrador: true` → el artículo se excluye del build.
- `destacada: true` → se usa como noticia principal de la portada.
- `ultimaHora: true` → aparece en la banda roja de ÚLTIMA HORA.

**Eliminar el contenido de demostración:** borrar los archivos
`src/content/noticias/2026-11-*.md` y sus imágenes `.jpg` asociadas.

### Agregar una categoría nueva

1. `src/content/config.ts`: agregar el valor al `z.enum`.
2. `public/admin/config.yml`: agregar la opción al widget select.
3. `src/components/Header.astro`: agregar el ítem al menú.
4. `src/pages/index.astro`: agregar el bloque al array `categorias`.
5. `src/pages/categoria/[category].astro`: agregar entrada a `CATEGORIAS`.
6. `src/lib/categorias.ts`: agregar el nombre para mostrar.

## Despliegue en Cloudflare Pages

1. Subir el proyecto a un repositorio de GitHub.
2. Cloudflare Dashboard → **Workers & Pages** → **Pages** → *Create project* → *Connect to Git*.
3. Configurar el build:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy.

Cada commit en la rama principal (incluidos los que genera Decap CMS al
publicar una noticia) dispara un build automático. La nueva noticia aparece
publicada cuando termina el build (normalmente 1–2 minutos).

## Autenticación del panel (producción)

GitHub no permite callbacks OAuth a sitios estáticos: se usa un Worker como
proxy. Pasos completos en `public/admin/config.yml` (comentarios) y
`workers/oauth/worker.js`:

1. GitHub → *Settings* → *Developer settings* → *OAuth Apps* → *New OAuth App*
   - Homepage URL: `https://tudominio.com`
   - Authorization callback URL: `https://nuestra-clorinda-oauth.TU_USUARIO.workers.dev/callback`
2. Desplegar el Worker:

   ```bash
   cd workers/oauth
   npx wrangler deploy
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   ```

3. En `public/admin/config.yml` completar `repo`, `branch` y descomentar
   `auth_endpoint` apuntando a `https://nuestra-clorinda-oauth.TU_USUARIO.workers.dev/auth`.

### Permisos mínimos

El scope se define en `workers/oauth/wrangler.toml` (`OAUTH_SCOPE`): `public_repo` si el repositorio es público, `repo` si es privado. El token nunca pasa por el código del sitio: solo transita por
el Worker y queda en el navegador del editor.

## RSS, sitemap y robots

- `/rss.xml` — feed RSS generado con cada build.
- `/sitemap-index.xml` — sitemap automático (integración `@astrojs/sitemap`).
- `/robots.txt` — permite todo excepto `/admin`.

## Publicidad y newsletter

Los espacios publicitarios (`src/components/Advertisement.astro`) están
**desactivados por defecto** (`activo={false}`) para no mostrar huecos vacíos.
Para activar uno, pasar `activo` en la página que corresponda y cargar el
script oficial de la red publicitaria dentro del componente.

El bloque de newsletter (`Newsletter.astro`) **no está incluido en la portada**. Envía a `/api/newsletter`, que **no existe todavía**:
conectar un proveedor real (Buttondown, Mailchimp, etc.) antes de ofrecer la
suscripción al público.

## Verificación post-despliegue

- [ ] `/` muestra la portada con la noticia destacada y las secciones.
- [ ] `/noticias/` pagina las últimas noticias.
- [ ] `/categoria/politica` (y el resto) filtran correctamente.
- [ ] Un artículo muestra breadcrumbs, botón de WhatsApp y "copiar enlace".
- [ ] `/rss.xml`, `/sitemap-index.xml` y `/robots.txt` responden.
- [ ] `/admin` carga Decap CMS.
- [ ] Publicar desde el CMS genera un commit y, tras el build, la noticia aparece en el sitio.
- [ ] Lighthouse: Performance ≥ 90, SEO/Accesibilidad/Best Practices ≥ 95.

## Estructura

```
src/
  components/    Header, BreakingNews, FeaturedNews, NewsCard, CategorySection,
                 MostRead, Advertisement, Newsletter, ShareButtons, Breadcrumbs, Footer
  layouts/       BaseLayout
  pages/         index, noticias/[slug], noticias/[...page] (archivo paginado),
                 categoria/[category], 404, rss.xml.ts, robots.txt.ts
  content/       noticias/ + config.ts
  styles/        global.css
public/
  admin/         Decap CMS
  uploads/       imágenes subidas desde el CMS
workers/oauth/   Worker de autenticación GitHub OAuth
```
