export interface Materia {
  id: string;
  nombre: string;
  creditos: number;
  calificacion: number;
}

export async function getMaterias(): Promise<Materia[]> {
  const res = await fetch('/api/calculadora');
  if (!res.ok) throw new Error('Error al obtener materias');
  const data = await res.json();
  return data.materias;
}

export async function addMateria(
  nombre: string,
  creditos: number,
  calificacion: number
): Promise<Materia> {
  const res = await fetch('/api/calculadora', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, creditos, calificacion }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al agregar materia');
  }
  const data = await res.json();
  return data.materia;
}

export async function deleteMateria(id: string): Promise<void> {
  const res = await fetch(`/api/calculadora?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar materia');
}

export function calcularPromedioProyectado(
  promedioActual: number,
  creditosAcumulados: number,
  materias: Materia[]
): number {
  if (materias.length === 0) return promedioActual;

  const creditosNuevos = materias.reduce((sum, m) => sum + m.creditos, 0);
  const puntosNuevos = materias.reduce((sum, m) => sum + m.calificacion * m.creditos, 0);
  const puntosActuales = promedioActual * creditosAcumulados;

  return (puntosActuales + puntosNuevos) / (creditosAcumulados + creditosNuevos);
}