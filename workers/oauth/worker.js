/**
 * Cloudflare Worker — OAuth proxy para Decap CMS + GitHub.
 *
 * Despliegue:
 *   cd workers/oauth
 *   npx wrangler deploy
 *   npx wrangler secret put GITHUB_CLIENT_ID
 *   npx wrangler secret put GITHUB_CLIENT_SECRET
 *
 * Permisos: el scope se define en wrangler.toml (OAUTH_SCOPE). El token solo se
 * entrega al navegador del editor que inició sesión.
 */
const COOKIE = 'oauth_state';

function randomState() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const match = header.split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
  return match ? match.slice(name.length + 1) : null;
}

function page(script) {
  return new Response(`<!doctype html><meta charset="utf-8"><script>${script}</script>`, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': `${COOKIE}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax`,
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const clientId = env.GITHUB_CLIENT_ID;
    const clientSecret = env.GITHUB_CLIENT_SECRET;
    const scope = env.OAUTH_SCOPE || 'public_repo';

    if (!clientId || !clientSecret) {
      return new Response('Worker sin configurar: faltan GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET', { status: 500 });
    }

    if (url.pathname === '/auth') {
      const state = randomState();
      const authorize = new URL('https://github.com/login/oauth/authorize');
      authorize.searchParams.set('client_id', clientId);
      authorize.searchParams.set('redirect_uri', url.origin + '/callback');
      authorize.searchParams.set('scope', scope);
      authorize.searchParams.set('state', state);
      return new Response(null, {
        status: 302,
        headers: {
          Location: authorize.toString(),
          'Set-Cookie': `${COOKIE}=${state}; Path=/; Max-Age=600; Secure; HttpOnly; SameSite=Lax`,
        },
      });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      if (!code) return new Response('Falta el código de autorización', { status: 400 });
      if (!state || state !== readCookie(request, COOKIE)) {
        return new Response('Estado OAuth inválido. Volvé a iniciar sesión desde /admin.', { status: 400 });
      }

      const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
      });
      const data = await res.json();

      if (!data.access_token) {
        return new Response('GitHub no devolvió un token.', { status: 502 });
      }

      const message = 'authorization:github:success:' +
        JSON.stringify({ token: data.access_token, provider: 'github' });
      // JSON.stringify produce un literal JS seguro para incrustar en el script.
      const literal = JSON.stringify(message).replace(/</g, '\\u003c');

      return page(`
        (function () {
          var message = ${literal};
          function receive(e) {
            window.opener.postMessage(message, e.origin);
          }
          window.addEventListener('message', receive, false);
          window.opener.postMessage('authorizing:github', '*');
        })();`);
    }

    return new Response('Not found', { status: 404 });
  },
};
