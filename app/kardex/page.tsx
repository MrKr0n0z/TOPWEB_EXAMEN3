'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getKardex } from '@/services/studentService';
import { logout } from '@/services/authService';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap');
  @keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  @keyframes shimmer { 0%{background-position:-1000px 0} 100%{background-position:1000px 0} }
  .skeleton { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite; }
  .fade-in  { animation: fadeIn 0.4s ease forwards; }
  .row-hover:hover { background-color: #F5F3EF !important; }
  .spinner { width: 48px; height: 48px; border: 4px solid rgba(22,34,64,0.1); border-top: 4px solid #162240; border-radius: 50%; animation: spin 1s linear infinite; }
`;

const NAV_LINKS = [
  { href: '/dashboard',      label: 'Inicio' },
  { href: '/calificaciones', label: 'Calificaciones' },
  { href: '/kardex',         label: 'Kardex' },
  { href: '/horario',        label: 'Horario' },
];

function GradeBadge({ value }: { value: string }) {
  const n = parseFloat(value);
  if (!value || n === 0) return <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#AAAAAA' }}>—</span>;
  const { bg, text } = n >= 90 ? { bg: '#DCFCE7', text: '#166534' }
    : n >= 70 ? { bg: '#FEF9C3', text: '#854D0E' }
    : { bg: '#FEE2E2', text: '#991B1B' };
  return <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 500, color: text, backgroundColor: bg, padding: '3px 10px', borderRadius: '20px' }}>{n}</span>;
}

function DescBadge({ value }: { value: string }) {
  const isRep = value?.includes('REPETICIÓN');
  const isEsp = value?.includes('ESPECIAL');
  const color = isRep ? '#991B1B' : isEsp ? '#854D0E' : '#666';
  const bg    = isRep ? '#FEE2E2' : isEsp ? '#FEF9C3' : '#F0F0F0';
  return <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 500, color, backgroundColor: bg, padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{value}</span>;
}

export default function KardexPage() {
  const router = useRouter();
  const [data, setData]           = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    getKardex()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const Navbar = () => (
    <nav style={{ backgroundColor: '#162240', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '0.5px solid #243660' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <img src="/images/logo-itc.png" alt="ITC Logo" style={{ height: '40px', width: 'auto' }} />
        <span style={{ fontFamily: "'EB Garamond',serif", color: '#F5F3EF', fontSize: '18px', fontWeight: 500 }}>Portal Estudiante</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === '/kardex';
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
      <div style={{ backgroundColor: '#F5F3EF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '24px', padding: '40px 24px' }}>
          <div className="spinner" />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: "'Inter',sans-serif", color: '#162240', fontSize: '14px', fontWeight: 500, margin: '0 0 8px 0', letterSpacing: '0.5px' }}>Cargando kardex...</p>
            <p style={{ fontFamily: "'Inter',sans-serif", color: '#999999', fontSize: '12px', fontWeight: 400, margin: 0, letterSpacing: '0.3px' }}>Por favor espera mientras obtenemos tus datos</p>
          </div>
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
            <p style={{ fontFamily: "'EB Garamond',serif", color: '#991B1B', fontSize: '22px', margin: '0 0 12px 0' }}>Error al cargar kardex</p>
            <p style={{ fontFamily: "'Inter',sans-serif", color: '#991B1B', fontSize: '13px', margin: '0 0 20px 0' }}>{error}</p>
            <button onClick={() => router.push('/login')} style={{ padding: '10px 20px', backgroundColor: '#991B1B', color: '#FFF', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '13px' }}>Volver al Login</button>
          </div>
        </div>
      </div>
    </>
  );

  // ── Parse: data.data.kardex[] ─────────────────────────────────────────────
  const avance: number     = data?.data?.porcentaje_avance ?? 0;
  const kardex: any[]      = data?.data?.kardex ?? [];

  // Group by semestre (number)
  const groups: Record<number, any[]> = {};
  kardex.forEach((m: any) => {
    const s = m.semestre ?? 0;
    if (!groups[s]) groups[s] = [];
    groups[s].push(m);
  });
  const semestres = Object.keys(groups).map(Number).sort((a, b) => a - b);

  const aprobadas  = kardex.filter(m => parseFloat(m.calificacion) >= 70).length;
  const reprobadas = kardex.filter(m => { const n = parseFloat(m.calificacion); return n > 0 && n < 70; }).length;
  const sinCal     = kardex.filter(m => parseFloat(m.calificacion) === 0).length;
  const promedio   = kardex.length > 0
    ? (kardex.filter(m => parseFloat(m.calificacion) > 0)
        .reduce((acc, m) => acc + parseFloat(m.calificacion), 0) /
       kardex.filter(m => parseFloat(m.calificacion) > 0).length).toFixed(1)
    : '—';

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ backgroundColor: '#F5F3EF', minHeight: '100vh' }} className="fade-in">
        <Navbar />

        {/* Header */}
        <div style={{ backgroundColor: '#162240', padding: '36px 24px 28px' }}>
          <p style={{ fontFamily: "'Inter',sans-serif", color: 'rgba(245,243,239,0.65)', fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Historial Académico Completo</p>
          <h1 style={{ fontFamily: "'EB Garamond',serif", color: '#F5F3EF', fontSize: '34px', fontWeight: 500, margin: '0 0 16px 0' }}>Kardex</h1>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(245,243,239,0.2)', borderRadius: '2px', maxWidth: '300px' }}>
              <div style={{ height: '100%', width: `${avance}%`, backgroundColor: '#F5F3EF', borderRadius: '2px', transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ fontFamily: "'Inter',sans-serif", color: 'rgba(245,243,239,0.8)', fontSize: '12px' }}>{avance}% avance</span>
          </div>
        </div>

        {/* Summary */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', display: 'flex', gap: '40px', borderBottom: '0.5px solid #E0DDD6', flexWrap: 'wrap' }}>
          {[
            { label: 'Total',      value: kardex.length },
            { label: 'Aprobadas',  value: aprobadas,  color: '#166534' },
            { label: 'Reprobadas', value: reprobadas, color: '#991B1B' },
            { label: 'Sin cal.',   value: sinCal,     color: '#888' },
            { label: 'Promedio',   value: promedio },
            { label: 'Semestres',  value: semestres.length },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p style={{ fontFamily: "'EB Garamond',serif", color: color ?? '#162240', fontSize: '24px', fontWeight: 500, margin: 0 }}>{value}</p>
              <p style={{ fontFamily: "'Inter',sans-serif", color: '#888', fontSize: '10px', letterSpacing: '0.3px', textTransform: 'uppercase', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Semestres */}
        <div style={{ padding: '24px' }}>
          {semestres.map(sem => {
            const materias = groups[sem];
            const promSem = materias.filter(m => parseFloat(m.calificacion) > 0).length > 0
              ? (materias.filter(m => parseFloat(m.calificacion) > 0)
                  .reduce((acc, m) => acc + parseFloat(m.calificacion), 0) /
                 materias.filter(m => parseFloat(m.calificacion) > 0).length).toFixed(1)
              : '—';

            return (
              <div key={sem} style={{ marginBottom: '20px', borderRadius: '10px', overflow: 'hidden', border: '0.5px solid #E0DDD6' }}>
                {/* Semester header */}
                <div style={{ backgroundColor: '#162240', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: "'EB Garamond',serif", color: '#F5F3EF', fontSize: '17px', fontWeight: 500, margin: 0 }}>
                    Semestre {sem}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", color: 'rgba(245,243,239,0.55)', fontSize: '11px' }}>{materias.length} materias</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", color: '#F5F3EF', fontSize: '12px', fontWeight: 500, backgroundColor: 'rgba(245,243,239,0.15)', padding: '2px 10px', borderRadius: '20px' }}>
                      Prom. {promSem}
                    </span>
                  </div>
                </div>

                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 110px 80px 70px 130px', padding: '8px 20px', backgroundColor: '#F5F3EF', borderBottom: '0.5px solid #E0DDD6' }}>
                  {['Materia', 'Clave', 'Periodo', 'Cal.', 'Tipo'].map(h => (
                    <p key={h} style={{ fontFamily: "'Inter',sans-serif", color: '#888', fontSize: '10px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0 }}>{h}</p>
                  ))}
                </div>

                {/* Rows */}
                {materias.map((m: any, idx: number) => (
                  <div key={idx} className="row-hover"
                    style={{ display: 'grid', gridTemplateColumns: '2fr 110px 80px 70px 130px', padding: '12px 20px', borderBottom: idx < materias.length - 1 ? '0.5px solid #E0DDD6' : 'none', alignItems: 'center', backgroundColor: '#FFFFFF', transition: 'background 0.15s' }}>
                    <p style={{ fontFamily: "'EB Garamond',serif", color: '#162240', fontSize: '15px', margin: 0 }}>{m.nombre_materia}</p>
                    <p style={{ fontFamily: "'Inter',sans-serif", color: '#888', fontSize: '11px', margin: 0 }}>{m.clave_materia}</p>
                    <p style={{ fontFamily: "'Inter',sans-serif", color: '#666', fontSize: '12px', margin: 0 }}>{m.periodo}</p>
                    <div><GradeBadge value={m.calificacion} /></div>
                    <div><DescBadge value={m.descripcion} /></div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}