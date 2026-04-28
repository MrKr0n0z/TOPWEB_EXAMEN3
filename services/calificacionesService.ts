function getTokenFromCookie(): string | null {
  const cookieName = 'sii_token=';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(cookieName) === 0) {
      return decodeURIComponent(cookie.substring(cookieName.length));
    }
  }
  return null;
}

export interface CalificacionAPI {
  id_calificacion: number;
  numero_calificacion: number;
  calificacion: string | null;
}

export interface MateriaAPI {
  materia: {
    id_grupo: number;
    nombre_materia: string;
    clave_materia: string;
    letra_grupo: string;
  };
  calificaiones: CalificacionAPI[];
}

export interface MateriaCalculadora {
  id_grupo: number;
  nombre: string;
  clave: string;
  calificacionesReales: (number | null)[];
  promedioReal: number | null;
  totalEvaluaciones: number;
}

export async function getCalificacionesActuales(): Promise<MateriaCalculadora[]> {
  const token = getTokenFromCookie();
  if (!token) throw new Error('No token found');

  const res = await fetch('/api/movil/estudiante/calificaciones', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Error al obtener calificaciones');

  const data = await res.json();
  const materias: MateriaAPI[] = data.data?.[0]?.materias ?? [];

  return materias.map((m) => {
    const cals = m.calificaiones.map((c) =>
      c.calificacion !== null ? parseFloat(c.calificacion) : null
    );
    const reales = cals.filter((c): c is number => c !== null);
    const promedioReal = reales.length > 0
      ? reales.reduce((s, c) => s + c, 0) / reales.length
      : null;

    return {
      id_grupo: m.materia.id_grupo,
      nombre: m.materia.nombre_materia,
      clave: m.materia.clave_materia,
      calificacionesReales: cals,
      promedioReal,
      totalEvaluaciones: Math.max(m.calificaiones.length, 4),
    };
  });
}
