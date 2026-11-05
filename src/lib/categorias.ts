// Fuente única de nombres de categoría (slug → texto para mostrar).
export const NOMBRES_CATEGORIA: Record<string, string> = {
  politica: 'Política',
  sociedad: 'Sociedad',
  policiales: 'Policiales',
  deportes: 'Deportes',
  economia: 'Economía',
  cultura: 'Cultura',
  region: 'Región',
};

export const nombreCategoria = (slug: string) => NOMBRES_CATEGORIA[slug] ?? slug;
