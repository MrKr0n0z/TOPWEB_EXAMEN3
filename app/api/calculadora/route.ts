import { NextRequest, NextResponse } from 'next/server';

interface Materia {
  id: string;
  nombre: string;
  creditos: number;
  calificacion: number;
}

// Almacenamiento en memoria del servidor
const materias: Materia[] = [];

export async function GET() {
  return NextResponse.json({ materias });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { nombre, creditos, calificacion } = body;

  // Validaciones
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 });
  }
  if (!creditos || creditos < 1 || creditos > 10) {
    return NextResponse.json({ error: 'Créditos deben ser entre 1 y 10' }, { status: 400 });
  }
  if (calificacion < 0 || calificacion > 100) {
    return NextResponse.json({ error: 'Calificación debe ser entre 0 y 100' }, { status: 400 });
  }

  const nueva: Materia = {
    id: crypto.randomUUID(),
    nombre: nombre.trim(),
    creditos: Number(creditos),
    calificacion: Number(calificacion),
  };

  materias.push(nueva);
  return NextResponse.json({ materia: nueva }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const index = materias.findIndex((m) => m.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 });
  }

  materias.splice(index, 1);
  return NextResponse.json({ ok: true });
}