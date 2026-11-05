// El build corre en UTC (Cloudflare): se fija la zona horaria de Clorinda
// para que la hora publicada coincida con la que cargó el editor.
const TZ = 'America/Argentina/Cordoba'; // UTC-3 todo el año, igual que Formosa

export const fechaCorta = (d: Date) =>
  new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }).format(d);

export const fechaHora = (d: Date) =>
  new Intl.DateTimeFormat('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: TZ,
  }).format(d);
