'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCalificaciones } from '@/services/studentService';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap');
  @keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .skeleton { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite; }
  .fade-in  { animation: fadeIn 0.4s ease forwards; }
  .row-hover:hover { background-color: #F5F3EF !important; }
  input::placeholder { color: #AAAAAA; }
`;

const NAV_LINKS = [
  { href: '/dashboard',      label: 'Inicio' },
  { href: '/calificaciones', label: 'Calificaciones' },
  { href: '/kardex',         label: 'Kardex' },
  { href: '/horario',        label: 'Horario' },
];

function parseParciales(calificaiones: any[]) {
  const map: Record<number, string | null> = { 1: null, 2: null, 3: null, 4: null };
  (calificaiones ?? []).forEach((c: any) => { map[c.numero_calificacion] = c.calificacion; });
  return map;
}

function GradeBadge({ value }: { value: string | null }) {
  if (value === null || value === undefined) {
    return <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#AAAAAA' }}>—</span>;
  }
  const n = parseFloat(value);
  const { bg, text } = n >= 90
    ? { bg: '#DCFCE7', text: '#166534' }
    : n >= 70
    ? { bg: '#FEF9C3', text: '#854D0E' }
    : { bg: '#FEE2E2', text: '#991B1B' };
  return (
    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 500, color: text, backgroundColor: bg, padding: '3px 10px', borderRadius: '20px' }}>
      {n}
    </span>
  );
}

export default function CalificacionesPage() {
  const router = useRouter();
  const [data, setData]           = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    getCalificaciones()
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
            const active = href === '/calificaciones';
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
        <div style={{ padding: '40px 24px' }}>
          <div style={{ height: '28px', width: '220px', backgroundColor: '#E0DDD6', borderRadius: '6px', marginBottom: '24px' }} className="skeleton" />
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ height: '52px', backgroundColor: '#FFFFFF', borderRadius: '8px', marginBottom: '10px', border: '0.5px solid #E0DDD6' }} className="skeleton" />
          ))}
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
            <p style={{ fontFamily: "'EB Garamond',serif", color: '#991B1B', fontSize: '22px', margin: '0 0 12px 0' }}>Error al cargar calificaciones</p>
            <p style={{ fontFamily: "'Inter',sans-serif", color: '#991B1B', fontSize: '13px', margin: '0 0 20px 0' }}>{error}</p>
            <button onClick={() => router.push('/login')} style={{ padding: '10px 20px', backgroundColor: '#991B1B', color: '#FFF', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '13px' }}>
              Volver al Login
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const periodoObj  = data?.data?.[0]?.periodo ?? {};
  const periodLabel = periodoObj.descripcion_periodo ?? periodoObj.clave_periodo ?? '—';
  const materias: any[] = data?.data?.[0]?.materias ?? [];

  const filtered = materias.filter((item: any) => {
    const name  = (item.materia?.nombre_materia ?? '').toLowerCase();
    const clave = (item.materia?.clave_materia ?? '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || clave.includes(q);
  });

  const conCalif = materias.filter(m => (m.calificaiones ?? []).some((c: any) => c.calificacion !== null));

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ backgroundColor: '#F5F3EF', minHeight: '100vh' }} className="fade-in">
        <Navbar />

        <div style={{ backgroundColor: '#162240', padding: '36px 24px 28px' }}>
          <p style={{ fontFamily: "'Inter',sans-serif", color: 'rgba(245,243,239,0.65)', fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 8px 0' }}>{periodLabel}</p>
          <h1 style={{ fontFamily: "'EB Garamond',serif", color: '#F5F3EF', fontSize: '34px', fontWeight: 500, margin: 0 }}>Calificaciones</h1>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid #E0DDD6', gap: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar por materia o clave…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', padding: '8px 14px', border: '0.5px solid #D1CFC8', borderRadius: '7px', outline: 'none', width: '280px', backgroundColor: '#F5F3EF', color: '#162240' }}
          />
          <div style={{ display: 'flex', gap: '28px' }}>
            {[
              { label: 'Materias',   value: materias.length },
              { label: 'Con calif.', value: conCalif.length, color: '#166534' },
              { label: 'Sin calif.', value: materias.length - conCalif.length, color: '#888' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'EB Garamond',serif", color: color ?? '#162240', fontSize: '22px', fontWeight: 500, margin: 0 }}>{value}</p>
                <p style={{ fontFamily: "'Inter',sans-serif", color: '#888', fontSize: '10px', letterSpacing: '0.3px', textTransform: 'uppercase', margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '0.5px solid #E0DDD6', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 120px 70px 70px 70px 90px', padding: '10px 20px', backgroundColor: '#F5F3EF', borderBottom: '0.5px solid #E0DDD6' }}>
              {['Materia', 'Clave', 'P1', 'P2', 'P3', 'Final'].map(h => (
                <p key={h} style={{ fontFamily: "'Inter',sans-serif", color: '#888', fontSize: '10px', fontWeight: 500, letterSpacing: '0.6px', textTransform: 'uppercase', margin: 0, textAlign: h === 'Materia' || h === 'Clave' ? 'left' : 'center' }}>{h}</p>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ fontFamily: "'EB Garamond',serif", color: '#888', fontSize: '18px' }}>Sin resultados para "{search}"</p>
              </div>
            ) : (
              filtered.map((item: any, idx: number) => {
                const name  = item.materia?.nombre_materia ?? `Materia ${idx + 1}`;
                const clave = item.materia?.clave_materia ?? '—';
                const grupo = item.materia?.letra_grupo ?? '';
                const parc  = parseParciales(item.calificaiones ?? []);
                return (
                  <div key={idx} className="row-hover"
                    style={{ display: 'grid', gridTemplateColumns: '2fr 120px 70px 70px 70px 90px', padding: '14px 20px', borderBottom: idx < filtered.length - 1 ? '0.5px solid #E0DDD6' : 'none', alignItems: 'center', backgroundColor: '#FFFFFF', transition: 'background 0.15s' }}>
                    <div>
                      <p style={{ fontFamily: "'EB Garamond',serif", color: '#162240', fontSize: '16px', margin: 0 }}>{name}</p>
                      {grupo && <p style={{ fontFamily: "'Inter',sans-serif", color: '#AAA', fontSize: '10px', margin: '2px 0 0 0' }}>Grupo {grupo}</p>}
                    </div>
                    <p style={{ fontFamily: "'Inter',sans-serif", color: '#666', fontSize: '12px', margin: 0 }}>{clave}</p>
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} style={{ display: 'flex', justifyContent: 'center' }}>
                        <GradeBadge value={parc[n]} />
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}