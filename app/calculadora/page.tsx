'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useRouter } from 'next/navigation';
import { getCalificacionesActuales, MateriaCalculadora } from '@/services/calificacionesService';

function getEstado(promedio: number): { label: string; color: string; bg: string } {
  if (promedio >= 90) return { label: 'Excelente', color: '#166534', bg: '#DCFCE7' };
  if (promedio >= 80) return { label: 'Bueno', color: '#1e40af', bg: '#DBEAFE' };
  if (promedio >= 70) return { label: 'Regular', color: '#92400e', bg: '#FEF3C7' };
  return { label: 'En Riesgo', color: '#991B1B', bg: '#FEE2E2' };
}

interface MateriaSimulada extends MateriaCalculadora {
  calificacionesSimuladas: (number | null)[];
  creditosAsignados: number;
}

export default function CalculadoraPage() {
  const { profileData, isLoading } = useProfile();
  const router = useRouter();

  const [materias, setMaterias] = useState<MateriaSimulada[]>([]);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [metaPromedio, setMetaPromedio] = useState('');
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  useEffect(() => {
    getCalificacionesActuales()
      .then((data) => {
        const simuladas: MateriaSimulada[] = data.map((m) => ({
          ...m,
          calificacionesSimuladas: m.calificacionesReales.map((c) => c),
          creditosAsignados: 5,
        }));
        setMaterias(simuladas);
      })
      .catch(() => setErrorCarga('No se pudieron cargar las materias'))
      .finally(() => setLoadingMaterias(false));
  }, []);

  const promedioActual = profileData ? parseFloat(profileData.promedio_ponderado) : 0;
  const creditosAcumulados = profileData ? parseInt(profileData.creditos_acumulados) : 0;
  const semestre = profileData ? parseInt(profileData.semestre) : 0;
  const materiasAprobadas = profileData ? parseInt(profileData.materias_aprobadas) : 0;
  const totalMaterias = profileData ? parseInt(profileData.materias_cursadas) : 0;
  const tasaAprobacion = totalMaterias > 0 ? ((materiasAprobadas / totalMaterias) * 100).toFixed(1) : '0';
  const creditosRestantes = Math.max(0, 240 - creditosAcumulados);
  const semestresRestantes = creditosRestantes > 0
    ? Math.ceil(creditosRestantes / (creditosAcumulados / Math.max(semestre, 1)))
    : 0;

  const calcularPromedioMateria = (m: MateriaSimulada): number => {
    const vals = m.calificacionesSimuladas.filter((c): c is number => c !== null);
    if (vals.length === 0) return 0;
    return vals.reduce((s, c) => s + c, 0) / m.totalEvaluaciones;
  };

  const calcularCalNecesariaPorParcial = (m: MateriaSimulada): { valor: number; posible: boolean } | null => {
    const meta = parseFloat(metaPromedio);
    if (!meta) return null;
    const reales = m.calificacionesReales.filter((c): c is number => c !== null);
    const faltantes = m.totalEvaluaciones - reales.length;
    if (faltantes === 0) return null;
    const sumaReales = reales.reduce((s, c) => s + c, 0);
    const calNecesaria = (meta * m.totalEvaluaciones - sumaReales) / faltantes;
    return {
      valor: Math.max(0, calNecesaria),
      posible: calNecesaria <= 100,
    };
  };

  const aplicarMetaATodas = () => {
    const meta = parseFloat(metaPromedio);
    if (!meta) return;
    setMaterias((prev) =>
      prev.map((m) => {
        const resultado = calcularCalNecesariaPorParcial(m);
        if (!resultado || !resultado.posible) return m;
        const nuevas = m.calificacionesSimuladas.map((c, i) => {
          const esReal = m.calificacionesReales[i] !== null && m.calificacionesReales[i] !== undefined;
          return esReal ? c : Math.round(resultado.valor);
        });
        return { ...m, calificacionesSimuladas: nuevas };
      })
    );
  };

  const promedioProyectado = materias.length > 0
    ? (() => {
        const totalCreditos = materias.reduce((s, m) => s + m.creditosAsignados, 0);
        const totalPuntos = materias.reduce((s, m) => s + calcularPromedioMateria(m) * m.creditosAsignados, 0);
        const promedioSemestre = totalCreditos > 0 ? totalPuntos / totalCreditos : 0;
        return ((promedioActual * creditosAcumulados) + (promedioSemestre * totalCreditos)) / (creditosAcumulados + totalCreditos);
      })()
    : promedioActual;

  const diferencia = promedioProyectado - promedioActual;
  const estadoActual = getEstado(promedioActual);
  const estadoProyectado = getEstado(promedioProyectado);

  const calNecesaria = (() => {
    const meta = parseFloat(metaPromedio);
    if (!meta || meta <= promedioActual) return null;
    const creditosNuevos = materias.reduce((s, m) => s + m.creditosAsignados, 0) || 30;
    const cal = ((meta * (creditosAcumulados + creditosNuevos)) - (promedioActual * creditosAcumulados)) / creditosNuevos;
    return Math.min(100, Math.max(0, cal)).toFixed(1);
  })();

  const handleSimular = (idGrupo: number, evalIndex: number, valor: number) => {
    setMaterias((prev) =>
      prev.map((m) => {
        if (m.id_grupo !== idGrupo) return m;
        const nuevas = [...m.calificacionesSimuladas];
        nuevas[evalIndex] = valor;
        return { ...m, calificacionesSimuladas: nuevas };
      })
    );
  };

  const handleCreditos = (idGrupo: number, valor: number) => {
    setMaterias((prev) =>
      prev.map((m) => m.id_grupo === idGrupo ? { ...m, creditosAsignados: valor } : m)
    );
  };

  const resetMateria = (idGrupo: number) => {
    setMaterias((prev) =>
      prev.map((m) => {
        if (m.id_grupo !== idGrupo) return m;
        return { ...m, calificacionesSimuladas: [...m.calificacionesReales] };
      })
    );
  };

  if (isLoading || loadingMaterias) {
    return (
      <div style={{ backgroundColor: '#F5F3EF', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontFamily: "'Inter', sans-serif", color: '#162240' }}>Cargando datos académicos...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap');
        input[type=range] { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px; background: #E0DDD6; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #162240; cursor: pointer; }
      `}</style>
      <div style={{ backgroundColor: '#F5F3EF', minHeight: '100vh' }}>

        <nav style={{ backgroundColor: '#162240', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/images/logo-itc.png" alt="ITC Logo" style={{ height: '40px', width: 'auto' }} />
            <h1 style={{ fontFamily: "'EB Garamond', serif", color: '#F5F3EF', fontSize: '18px', fontWeight: 500, margin: 0 }}>Portal Estudiante</h1>
          </div>
          <button onClick={() => router.push('/dashboard')}
            style={{ fontFamily: "'Inter', sans-serif", padding: '8px 16px', fontSize: '12px', fontWeight: 500, backgroundColor: 'transparent', color: '#F5F3EF', border: '0.5px solid #F5F3EF', borderRadius: '7px', cursor: 'pointer' }}>
            Volver al Dashboard
          </button>
        </nav>

        <div style={{ backgroundColor: '#162240', padding: '40px 24px' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", color: '#F5F3EF', fontSize: '13px', margin: '0 0 8px 0', opacity: 0.8 }}>Herramienta académica</p>
          <h2 style={{ fontFamily: "'EB Garamond', serif", color: '#F5F3EF', fontSize: '32px', fontWeight: 500, margin: '0 0 16px 0' }}>Calculadora de Promedio Proyectado</h2>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 500, padding: '4px 12px', borderRadius: '20px', backgroundColor: estadoActual.bg, color: estadoActual.color }}>
            Estado actual: {estadoActual.label}
          </span>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', borderBottom: '0.5px solid #E0DDD6' }}>
          {[
            { valor: promedioActual.toFixed(2), label: 'Promedio Actual', color: '#162240', bg: undefined },
            { valor: promedioProyectado.toFixed(2), label: 'Promedio Proyectado', color: estadoProyectado.color, bg: undefined },
            { valor: `${diferencia >= 0 ? '+' : ''}${diferencia.toFixed(2)}`, label: 'Impacto', color: diferencia >= 0 ? '#166534' : '#991B1B', bg: undefined },
            { valor: estadoProyectado.label, label: 'Estado Proyectado', color: estadoProyectado.color, bg: estadoProyectado.bg },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'EB Garamond', serif", color: item.color, fontSize: '28px', fontWeight: 500, margin: '0 0 4px 0', backgroundColor: item.bg, borderRadius: item.bg ? '20px' : undefined, padding: item.bg ? '4px 0' : undefined }}>
                {item.valor}
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#666666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0 }}>{item.label}</p>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#162240', padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', borderBottom: '0.5px solid #E0DDD6' }}>
          {[
            { valor: `${tasaAprobacion}%`, label: 'Tasa de Aprobación' },
            { valor: creditosAcumulados, label: 'Créditos Acumulados' },
            { valor: creditosRestantes, label: 'Créditos Restantes' },
            { valor: `~${semestresRestantes}`, label: 'Semestres Restantes' },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'EB Garamond', serif", color: '#F5F3EF', fontSize: '24px', fontWeight: 500, margin: '0 0 4px 0' }}>{item.valor}</p>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#F5F3EF', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0, opacity: 0.7 }}>{item.label}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: '32px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", color: '#4A8CF5', fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
              Materias del Periodo Actual — Simula tus calificaciones faltantes
            </p>

            {errorCarga && (
              <div style={{ padding: '16px', backgroundColor: '#FEE2E2', borderRadius: '10px' }}>
                <p style={{ fontFamily: "'Inter', sans-serif", color: '#991B1B', fontSize: '13px', margin: 0 }}>{errorCarga}</p>
              </div>
            )}

            {materias.map((m) => {
              const promedio = calcularPromedioMateria(m);
              const promFinal = m.calificacionesSimuladas.filter(c => c !== null).length > 0
                ? promedio * (m.totalEvaluaciones / m.calificacionesSimuladas.filter(c => c !== null).length)
                : 0;
              const estado = getEstado(promFinal);
              return (
                <div key={m.id_grupo} style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '0.5px solid #E0DDD6', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <p style={{ fontFamily: "'EB Garamond', serif", color: '#162240', fontSize: '17px', fontWeight: 500, margin: '0 0 2px 0' }}>{m.nombre}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", color: '#666666', fontSize: '11px', margin: 0 }}>{m.clave}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '10px', backgroundColor: estado.bg, color: estado.color }}>
                        {promFinal > 0 ? `${promFinal.toFixed(1)} pts` : 'Sin calificaciones'}
                      </span>
                      <button onClick={() => resetMateria(m.id_grupo)}
                        style={{ fontFamily: "'Inter', sans-serif", padding: '4px 10px', fontSize: '10px', backgroundColor: 'transparent', color: '#666666', border: '0.5px solid #E0DDD6', borderRadius: '7px', cursor: 'pointer' }}>
                        Reset
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
                    {Array.from({ length: m.totalEvaluaciones }).map((_, i) => {
                      const real = m.calificacionesReales[i];
                      const sim = m.calificacionesSimuladas[i];
                      const esReal = real !== null && real !== undefined;
                      return (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: '#666666', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Eval {i + 1}</p>
                          {esReal ? (
                            <div style={{ padding: '8px', backgroundColor: '#F0F7F0', borderRadius: '7px', border: '0.5px solid #BBF7D0' }}>
                              <p style={{ fontFamily: "'EB Garamond', serif", color: '#166534', fontSize: '18px', fontWeight: 500, margin: 0 }}>{real}</p>
                              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: '#166534', margin: 0 }}>Real</p>
                            </div>
                          ) : (
                            <div style={{ padding: '8px', backgroundColor: '#F5F3EF', borderRadius: '7px', border: '0.5px solid #E0DDD6' }}>
                              <p style={{ fontFamily: "'EB Garamond', serif", color: '#162240', fontSize: '18px', fontWeight: 500, margin: '0 0 4px 0' }}>{sim ?? '—'}</p>
                              <input type="range" min={0} max={100} step={1}
                                value={sim ?? 70}
                                onChange={(e) => handleSimular(m.id_grupo, i, Number(e.target.value))}
                                style={{ marginTop: '4px' }}
                              />
                              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: '#666666', margin: '2px 0 0 0' }}>Simulado</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '12px', borderTop: '0.5px solid #E0DDD6' }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#666666', margin: 0 }}>Créditos:</p>
                    {[3, 4, 5, 6, 7].map((c) => (
                      <button key={c} onClick={() => handleCreditos(m.id_grupo, c)}
                        style={{ fontFamily: "'Inter', sans-serif", padding: '4px 10px', fontSize: '11px', fontWeight: 500, backgroundColor: m.creditosAsignados === c ? '#162240' : 'transparent', color: m.creditosAsignados === c ? '#F5F3EF' : '#162240', border: '0.5px solid #162240', borderRadius: '7px', cursor: 'pointer' }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '0.5px solid #E0DDD6', padding: '24px' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#4A8CF5', fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px 0' }}>Meta de Promedio</p>
              <label style={{ fontFamily: "'Inter', sans-serif", display: 'block', color: '#162240', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>Promedio objetivo</label>
              <input type="number" value={metaPromedio} onChange={(e) => setMetaPromedio(e.target.value)} min={0} max={100} placeholder="Ej. 90"
                style={{ width: '100%', padding: '10px 12px', fontFamily: "'Inter', sans-serif", fontSize: '13px', border: '0.5px solid #E0DDD6', borderRadius: '7px', boxSizing: 'border-box', color: '#162240', marginBottom: '12px' }} />

              {metaPromedio && (
                <>
                  <div style={{ padding: '14px', backgroundColor: parseFloat(metaPromedio) <= promedioActual ? '#DCFCE7' : '#DBEAFE', borderRadius: '7px', marginBottom: '12px' }}>
                    {parseFloat(metaPromedio) <= promedioActual ? (
                      <p style={{ fontFamily: "'Inter', sans-serif", color: '#166534', fontSize: '13px', margin: 0, fontWeight: 500 }}>
                        Ya superaste esa meta con {promedioActual.toFixed(2)}
                      </p>
                    ) : (
                      <>
                        <p style={{ fontFamily: "'Inter', sans-serif", color: '#1e40af', fontSize: '12px', margin: '0 0 4px 0' }}>
                          Promedio necesario este semestre:
                        </p>
                        <p style={{ fontFamily: "'EB Garamond', serif", color: '#162240', fontSize: '28px', fontWeight: 500, margin: '0 0 12px 0' }}>
                          {calNecesaria} pts
                        </p>
                      </>
                    )}
                  </div>

                  {parseFloat(metaPromedio) > promedioActual && (
                    <>
                      <p style={{ fontFamily: "'Inter', sans-serif", color: '#162240', fontSize: '11px', fontWeight: 500, margin: '0 0 8px 0' }}>
                        Calificación necesaria por parcial:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                        {materias.map((m) => {
                          const resultado = calcularCalNecesariaPorParcial(m);
                          const realesCount = m.calificacionesReales.filter(c => c !== null).length;
                          const faltantes = m.totalEvaluaciones - realesCount;
                          if (faltantes === 0) return null;
                          return (
                            <div key={m.id_grupo} style={{ padding: '10px 12px', backgroundColor: resultado?.posible ? '#F5F3EF' : '#FEE2E2', borderRadius: '7px', border: `0.5px solid ${resultado?.posible ? '#E0DDD6' : '#FECACA'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <p style={{ fontFamily: "'Inter', sans-serif", color: '#162240', fontSize: '11px', margin: 0, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {m.nombre}
                              </p>
                              <div style={{ textAlign: 'right' }}>
                                {resultado?.posible ? (
                                  <>
                                    <p style={{ fontFamily: "'EB Garamond', serif", color: '#162240', fontSize: '16px', fontWeight: 500, margin: 0 }}>
                                      {resultado.valor.toFixed(1)} pts
                                    </p>
                                    <p style={{ fontFamily: "'Inter', sans-serif", color: '#666666', fontSize: '9px', margin: 0 }}>
                                      por parcial
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p style={{ fontFamily: "'EB Garamond', serif", color: '#991B1B', fontSize: '14px', fontWeight: 500, margin: 0 }}>
                                      {resultado?.valor.toFixed(1)} pts
                                    </p>
                                    <p style={{ fontFamily: "'Inter', sans-serif", color: '#991B1B', fontSize: '9px', margin: 0 }}>
                                      imposible
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button onClick={aplicarMetaATodas}
                        style={{ width: '100%', padding: '10px', fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 500, color: '#F5F3EF', backgroundColor: '#16401c', border: 'none', borderRadius: '7px', cursor: 'pointer' }}>
                        Aplicar meta a simulación
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            <div style={{ backgroundColor: '#162240', borderRadius: '10px', padding: '24px' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#F5F3EF', fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px 0', opacity: 0.7 }}>Resumen del Semestre</p>
              {materias.map((m) => {
                const prom = calcularPromedioMateria(m);
                const count = m.calificacionesSimuladas.filter(c => c !== null).length;
                const promFinal = count > 0 ? prom * (m.totalEvaluaciones / count) : 0;
                const est = getEstado(promFinal);
                return (
                  <div key={m.id_grupo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", color: '#F5F3EF', fontSize: '12px', margin: 0, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nombre}</p>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '10px', backgroundColor: est.bg, color: est.color, flexShrink: 0 }}>
                      {promFinal > 0 ? promFinal.toFixed(1) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
