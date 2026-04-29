'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getHorarios } from '@/services/studentService';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap');
  @keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .skeleton { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite; }
  .fade-in  { animation: fadeIn 0.4s ease forwards; }
  .class-card { transition: transform 0.15s, box-shadow 0.15s; }
  .class-card:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(22,34,64,0.13) !important; }
`;

const NAV_LINKS = [
  { href: '/dashboard',      label: 'Inicio' },
  { href: '/calificaciones', label: 'Calificaciones' },
  { href: '/kardex',         label: 'Kardex' },
  { href: '/horario',        label: 'Horario' },
];

const DAYS = [
  { key: 'lunes',     label: 'Lunes',     salon: 'lunes_clave_salon',     color: '#4A8CF5' },
  { key: 'martes',    label: 'Martes',    salon: 'martes_clave_salon',    color: '#8B5CF6' },
  { key: 'miercoles', label: 'Miércoles', salon: 'miercoles_clave_salon', color: '#10B981' },
  { key: 'jueves',    label: 'Jueves',    salon: 'jueves_clave_salon',    color: '#F59E0B' },
  { key: 'viernes',   label: 'Viernes',   salon: 'viernes_clave_salon',   color: '#EF4444' },
  { key: 'sabado',    label: 'Sábado',    salon: 'sabado_clave_salon',    color: '#6B7280' },
];

export default function HorarioPage() {
  const router = useRouter();
  const [data, setData]           = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [view, setView]           = useState<'semana' | 'lista'>('semana');

  useEffect(() => {
    getHorarios()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = () => {
    document.cookie = 'sii_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  const Navbar = () => (
    <nav style={{ backgroundColor: '#162240', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '0.5px solid #243660' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <span style={{ fontFamily: "'EB Garamond',serif", color: '#F5F3EF', fontSize: '18px', fontWeight: 500 }}>Portal Estudiante</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === '/horario';
            return (
              <a key={href} href={href} style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 500, color: active ? '#F5F3EF' : 'rgba(245,243,239,0.55)', padding: '6px 12px', borderRadius: '6px', backgroundColor: active ? 'rgba(245,243,239,0.12)' : 'transparent', letterSpacing: '0.3px', textDecoration: 'none' }}>
                {label}
              </a>
            );
          })}
        </div>
      </div>
      <button onClick={handleLogout} style={{ fontFamily: "'Inter',sans-serif", padding: '6px 14px', fontSize: '12px', fontWeight: 500, backgroundColor: 'transparent', color: '#F5F3EF', border: '0.5px solid rgba(245,243,239,0.4)', borderRadius: '7px', cursor: 'pointer' }}>
        Cerrar Sesión
      </button>
    </nav>
  );

  if (isLoading) return (
    <>
      <style>{STYLES}</style>
      <div style={{ backgroundColor: '#F5F3EF', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ padding: '40px 24px', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '16px' }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', height: '280px', border: '0.5px solid #E0DDD6' }} className="skeleton" />)}
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <style>{STYLES}</style>
      <div style={{ backgroundColor: '#F5F3EF', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 52px)' }}>
          <div style={{ backgroundColor: '#FEE2E2', border: '0.5px solid #FECACA', borderRadius: '10px', padding: '32px', maxWidth: '420px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'EB Garamond',serif", color: '#991B1B', fontSize: '22px', margin: '0 0 12px 0' }}>Error al cargar horario</p>
            <p style={{ fontFamily: "'Inter',sans-serif", color: '#991B1B', fontSize: '13px', margin: '0 0 20px 0' }}>{error}</p>
            <button onClick={() => router.push('/login')} style={{ padding: '10px 20px', backgroundColor: '#991B1B', color: '#FFF', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '13px' }}>Volver al Login</button>
          </div>
        </div>
      </div>
    </>
  );

  // ── Parse: data.data[0].horario[] ─────────────────────────────────────────
  const periodoObj  = data?.data?.[0]?.periodo ?? {};
  const periodLabel = periodoObj.descripcion_periodo ?? '—';
  const horario: any[] = data?.data?.[0]?.horario ?? [];

  // Build day → classes map
  // Each materia has lunes/martes/etc as "HH:MM-HH:MM" or null
  type ClassSlot = { nombre_materia: string; clave_materia: string; letra_grupo: string; hora: string; salon: string };
  const dayMap: Record<string, ClassSlot[]> = {};
  DAYS.forEach(d => { dayMap[d.key] = []; });

  horario.forEach((mat: any) => {
    DAYS.forEach(d => {
      if (mat[d.key]) {
        dayMap[d.key].push({
          nombre_materia: mat.nombre_materia,
          clave_materia:  mat.clave_materia,
          letra_grupo:    mat.letra_grupo,
          hora:           mat[d.key],
          salon:          mat[d.salon] ?? '—',
        });
      }
    });
  });

  // Sort each day by start time
  DAYS.forEach(d => {
    dayMap[d.key].sort((a, b) => a.hora.localeCompare(b.hora));
  });

  const activeDays = DAYS.filter(d => dayMap[d.key].length > 0);
  const totalClases = Object.values(dayMap).reduce((acc, arr) => acc + arr.length, 0);

  // List view: flatten sorted
  const listRows: { day: typeof DAYS[0]; slot: ClassSlot }[] = [];
  DAYS.forEach(d => { dayMap[d.key].forEach(slot => listRows.push({ day: d, slot })); });

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ backgroundColor: '#F5F3EF', minHeight: '100vh' }} className="fade-in">
        <Navbar />

        {/* Header */}
        <div style={{ backgroundColor: '#162240', padding: '36px 24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontFamily: "'Inter',sans-serif", color: 'rgba(245,243,239,0.65)', fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 8px 0' }}>{periodLabel}</p>
            <h1 style={{ fontFamily: "'EB Garamond',serif", color: '#F5F3EF', fontSize: '34px', fontWeight: 500, margin: 0 }}>Horario</h1>
          </div>
          <div style={{ display: 'flex', backgroundColor: 'rgba(245,243,239,0.1)', borderRadius: '8px', padding: '3px' }}>
            {(['semana', 'lista'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 500, padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: view === v ? '#F5F3EF' : 'transparent', color: view === v ? '#162240' : 'rgba(245,243,239,0.7)', transition: 'all 0.15s' }}>
                {v === 'semana' ? '📅 Semana' : '📋 Lista'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '14px 24px', display: 'flex', gap: '32px', borderBottom: '0.5px solid #E0DDD6' }}>
          {[
            { label: 'Materias', value: horario.length },
            { label: 'Clases/semana', value: totalClases },
            { label: 'Días activos', value: activeDays.length },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontFamily: "'EB Garamond',serif", color: '#162240', fontSize: '22px', fontWeight: 500, margin: 0 }}>{value}</p>
              <p style={{ fontFamily: "'Inter',sans-serif", color: '#888', fontSize: '10px', letterSpacing: '0.3px', textTransform: 'uppercase', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        {view === 'semana' ? (
          /* ── WEEK VIEW ─────────────────────────────────────────────────── */
          <div style={{ padding: '24px', overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeDays.length}, minmax(170px, 1fr))`, gap: '16px', minWidth: '600px' }}>
              {activeDays.map(day => (
                <div key={day.key}>
                  <div style={{ borderLeft: `3px solid ${day.color}`, paddingLeft: '10px', marginBottom: '12px' }}>
                    <p style={{ fontFamily: "'EB Garamond',serif", color: '#162240', fontSize: '18px', fontWeight: 500, margin: 0 }}>{day.label}</p>
                    <p style={{ fontFamily: "'Inter',sans-serif", color: '#888', fontSize: '11px', margin: 0 }}>{dayMap[day.key].length} clase{dayMap[day.key].length !== 1 ? 's' : ''}</p>
                  </div>
                  {dayMap[day.key].map((slot, i) => (
                    <div key={i} className="class-card"
                      style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '0.5px solid #E0DDD6', borderLeft: `3px solid ${day.color}`, padding: '12px 14px', marginBottom: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                      <p style={{ fontFamily: "'EB Garamond',serif", color: '#162240', fontSize: '14px', fontWeight: 500, margin: '0 0 6px 0', lineHeight: 1.3 }}>{slot.nombre_materia}</p>
                      <p style={{ fontFamily: "'Inter',sans-serif", color: day.color, fontSize: '12px', fontWeight: 500, margin: '0 0 3px 0' }}>⏰ {slot.hora}</p>
                      <p style={{ fontFamily: "'Inter',sans-serif", color: '#888', fontSize: '11px', margin: '0 0 2px 0' }}>📍 {slot.salon}</p>
                      <p style={{ fontFamily: "'Inter',sans-serif", color: '#AAA', fontSize: '10px', margin: 0 }}>Grupo {slot.letra_grupo} · {slot.clave_materia}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── LIST VIEW ─────────────────────────────────────────────────── */
          <div style={{ padding: '24px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '0.5px solid #E0DDD6', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 150px 100px 80px', padding: '10px 20px', backgroundColor: '#F5F3EF', borderBottom: '0.5px solid #E0DDD6' }}>
                {['Día', 'Materia', 'Horario', 'Salón', 'Grupo'].map(h => (
                  <p key={h} style={{ fontFamily: "'Inter',sans-serif", color: '#888', fontSize: '10px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0 }}>{h}</p>
                ))}
              </div>
              {listRows.map(({ day, slot }, idx) => (
                <div key={idx}
                  style={{ display: 'grid', gridTemplateColumns: '100px 1fr 150px 100px 80px', padding: '12px 20px', borderBottom: idx < listRows.length - 1 ? '0.5px solid #E0DDD6' : 'none', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 500, color: day.color, backgroundColor: `${day.color}18`, padding: '3px 8px', borderRadius: '20px', display: 'inline-block' }}>{day.label}</span>
                  <p style={{ fontFamily: "'EB Garamond',serif", color: '#162240', fontSize: '15px', margin: 0 }}>{slot.nombre_materia}</p>
                  <p style={{ fontFamily: "'Inter',sans-serif", color: '#666', fontSize: '12px', margin: 0 }}>{slot.hora}</p>
                  <p style={{ fontFamily: "'Inter',sans-serif", color: '#888', fontSize: '12px', margin: 0 }}>{slot.salon}</p>
                  <p style={{ fontFamily: "'Inter',sans-serif", color: '#AAA', fontSize: '12px', margin: 0 }}>Gpo. {slot.letra_grupo}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}