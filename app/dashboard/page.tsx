'use client';

import { useProfile } from '@/hooks/useProfile';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { profileData, isLoading, error } = useProfile();
  const router = useRouter();

  const handleLogout = () => {
    // Clear the sii_token cookie
    document.cookie = 'sii_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  // Debug: Log the current state
  console.log('Dashboard render state:', { isLoading, error, profileData });

  // Skeleton Loader Component
  if (isLoading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap');
          
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          
          .skeleton {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(22, 34, 64, 0.1);
            border-top: 4px solid #162240;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          .skeleton-shimmer {
            background: linear-gradient(
              90deg,
              #E0DDD6 0%,
              #E8E5DD 50%,
              #E0DDD6 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
          }
        `}</style>

        <div style={{ backgroundColor: '#F5F3EF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Navbar Skeleton */}
          <div style={{ backgroundColor: '#162240', height: '52px', display: 'flex', alignItems: 'center', paddingLeft: '24px' }} />

          {/* Central Loading Spinner */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            padding: '40px 24px',
          }}>
            <div className="spinner" />
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                color: '#162240',
                fontSize: '14px',
                fontWeight: 500,
                margin: '0 0 8px 0',
                letterSpacing: '0.5px',
              }}>
                Cargando tu información...
              </p>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                color: '#999999',
                fontSize: '12px',
                fontWeight: 400,
                margin: 0,
                letterSpacing: '0.3px',
              }}>
                Por favor espera mientras obtenemos tus datos
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error State Component
  if (error) {
    console.error('Dashboard error:', error);
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap');
        `}</style>

        <div style={{ backgroundColor: '#F5F3EF', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: '#FEE2E2', border: '0.5px solid #FECACA', borderRadius: '10px', padding: '32px', maxWidth: '500px', textAlign: 'center' }}>
            <h1 style={{ fontFamily: "'EB Garamond', serif", color: '#991B1B', fontSize: '24px', fontWeight: 500, letterSpacing: '0.5px', margin: '0 0 16px 0' }}>
              Error al Cargar Perfil
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", color: '#991B1B', fontSize: '14px', fontWeight: 400, margin: '0 0 24px 0', lineHeight: '1.6' }}>
              {error}
            </p>
            <details style={{ textAlign: 'left', marginBottom: '24px', padding: '12px', backgroundColor: '#FFCCCB', borderRadius: '7px', fontSize: '12px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Ver detalles técnicos</summary>
              <pre style={{ marginTop: '8px', overflow: 'auto', fontSize: '11px' }}>{error}</pre>
            </details>
            <button
              onClick={() => router.push('/login')}
              style={{
                fontFamily: "'Inter', sans-serif",
                padding: '12px 24px',
                fontSize: '13px',
                fontWeight: 500,
                backgroundColor: '#991B1B',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '7px',
                cursor: 'pointer',
                letterSpacing: '0.5px',
              }}
            >
              Volver al Login
            </button>
          </div>
        </div>
      </>
    );
  }

  // Dashboard Content
  if (!profileData) {
    return null;
  }

  // Parse student name
  const fullName = profileData.persona || '';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap');
      `}</style>

      <div style={{ backgroundColor: '#F5F3EF', minHeight: '100vh' }}>
        {/* Navbar */}
        <nav style={{ backgroundColor: '#162240', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '24px', paddingRight: '24px', borderBottom: '0.5px solid #E0DDD6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" fill="#F5F3EF" rx="4" />
              <path
                d="M16 8C11.58 8 8 11.58 8 16C8 20.42 11.58 24 16 24C20.42 24 24 20.42 24 16C24 11.58 20.42 8 16 8ZM16 22C12.68 22 10 19.32 10 16C10 12.68 12.68 10 16 10C19.32 10 22 12.68 22 16C22 19.32 19.32 22 16 22Z"
                fill="#162240"
              />
            </svg>
            <h1 style={{ fontFamily: "'EB Garamond', serif", color: '#F5F3EF', fontSize: '18px', fontWeight: 500, letterSpacing: '0.5px', margin: 0 }}>
              Portal Estudiante
            </h1>
          </div>
          <button
            onClick={handleLogout}
            style={{
              fontFamily: "'Inter', sans-serif",
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 'transparent',
              color: '#F5F3EF',
              border: '0.5px solid #F5F3EF',
              borderRadius: '7px',
              cursor: 'pointer',
              letterSpacing: '0.5px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(245, 243, 239, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Cerrar Sesión
          </button>
        </nav>

        {/* Hero */}
        <div style={{ backgroundColor: '#162240', padding: '48px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", color: '#F5F3EF', fontSize: '13px', fontWeight: 400, margin: '0 0 12px 0', letterSpacing: '0.5px', opacity: 0.8 }}>
              Bienvenido de vuelta
            </p>
            <h2 style={{ fontFamily: "'EB Garamond', serif", color: '#F5F3EF', fontSize: '36px', fontWeight: 500, letterSpacing: '0.5px', margin: 0 }}>
              {firstName} <em style={{ fontStyle: 'italic' }}>{lastName}</em>
            </h2>
          </div>
          {profileData.foto && (
            <img
              src={`data:image/jpeg;base64,${profileData.foto}`}
              alt="Perfil"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '7px',
                border: '1px solid #F5F3EF',
                objectFit: 'cover',
              }}
            />
          )}
        </div>

        {/* StatsRow */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', borderBottom: '0.5px solid #E0DDD6' }}>
          {/* Stat 1: Semestre */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: "'EB Garamond', serif", color: '#162240', fontSize: '24px', fontWeight: 500, margin: '0 0 4px 0' }}>
              {profileData.semestre}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", color: '#666666', fontSize: '11px', fontWeight: 400, margin: 0, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Semestre
            </p>
          </div>

          {/* Stat 2: Créditos */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: "'EB Garamond', serif", color: '#162240', fontSize: '24px', fontWeight: 500, margin: '0 0 4px 0' }}>
              {profileData.creditos_acumulados}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", color: '#666666', fontSize: '11px', fontWeight: 400, margin: 0, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Créditos
            </p>
          </div>

          {/* Stat 3: Promedio */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: "'EB Garamond', serif", color: '#162240', fontSize: '24px', fontWeight: 500, margin: '0 0 4px 0' }}>
              {parseFloat(profileData.promedio_ponderado).toFixed(1)}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", color: '#666666', fontSize: '11px', fontWeight: 400, margin: 0, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Promedio
            </p>
          </div>

          {/* Stat 4: Avance */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: "'EB Garamond', serif", color: '#162240', fontSize: '24px', fontWeight: 500, margin: '0 0 4px 0' }}>
              {profileData.porcentaje_avance}%
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", color: '#666666', fontSize: '11px', fontWeight: 400, margin: 0, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Avance
            </p>
          </div>
        </div>

        {/* CardGrid */}
        <div style={{ padding: '40px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {/* Card 1: Materias Cursadas */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '0.5px solid #E0DDD6', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#F0F0F0', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M10 8C8.9 8 8 8.9 8 10V38C8 39.1 8.9 40 10 40H38C39.1 40 40 39.1 40 38V10C40 8.9 39.1 8 38 8H10ZM10 10H38V38H10V10Z"
                  fill="#16401c"
                />
                <path d="M14 14H34V16H14V14Z" fill="#16401c" />
                <path d="M14 22H34V24H14V22Z" fill="#16401c" />
                <path d="M14 30H34V32H14V30Z" fill="#16401c" />
              </svg>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#4A8CF5', fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                Materias
              </p>
              <p style={{ fontFamily: "'EB Garamond', serif", color: '#162240', fontSize: '17px', fontWeight: 500, margin: '0 0 8px 0' }}>
                {profileData.materias_cursadas}
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#666666', fontSize: '12px', fontWeight: 400, margin: 0 }}>
                {profileData.materias_aprobadas} Aprobadas • {profileData.materias_reprobadas} Reprobadas
              </p>
            </div>
          </div>

          {/* Card 2: Avance Académico */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '0.5px solid #E0DDD6', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#F0F0F0', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="16" stroke="#16401c" strokeWidth="2" fill="none" />
                <path d="M24 8V24L32 32" stroke="#16401c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#4A8CF5', fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                Progreso
              </p>
              <p style={{ fontFamily: "'EB Garamond', serif", color: '#162240', fontSize: '17px', fontWeight: 500, margin: '0 0 8px 0' }}>
                {profileData.percentaje_avance_cursando}%
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#666666', fontSize: '12px', fontWeight: 400, margin: 0 }}>
                Avance del Semestre Actual
              </p>
            </div>
          </div>

          {/* Card 3: Información Institucional */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1.5px solid #4A8CF5', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#F0F0F0', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M24 8C15.2 8 8 15.2 8 24C8 32.8 15.2 40 24 40C32.8 40 40 32.8 40 24C40 15.2 32.8 8 24 8ZM24 36C17.4 36 12 30.6 12 24C12 17.4 17.4 12 24 12C30.6 12 36 17.4 36 24C36 30.6 30.6 36 24 36Z"
                  fill="#16401c"
                />
                <path d="M24 16V24L30 30" fill="#16401c" />
              </svg>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#4A8CF5', fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                Información
              </p>
              <p style={{ fontFamily: "'EB Garamond', serif", color: '#162240', fontSize: '17px', fontWeight: 500, margin: '0 0 8px 0' }}>
                {profileData.numero_control}
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#666666', fontSize: '12px', fontWeight: 400, margin: 0 }}>
                {profileData.email}
              </p>
            </div>
          </div>
{/* Card 4: Calculadora */}
          <div
            onClick={() => router.push('/calculadora')}
            style={{ backgroundColor: '#162240', borderRadius: '10px', border: '0.5px solid #E0DDD6', overflow: 'hidden', cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <div style={{ backgroundColor: '#16401c', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="8" width="32" height="32" rx="4" stroke="#F5F3EF" strokeWidth="2" fill="none" />
                <path d="M16 18H32M16 24H24M16 30H20" stroke="#F5F3EF" strokeWidth="2" strokeLinecap="round" />
                <circle cx="30" cy="30" r="4" fill="#F5F3EF" />
              </svg>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#F5F3EF', fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', margin: '0 0 12px 0', textTransform: 'uppercase', opacity: 0.7 }}>
                Herramienta
              </p>
              <p style={{ fontFamily: "'EB Garamond', serif", color: '#F5F3EF', fontSize: '17px', fontWeight: 500, margin: '0 0 8px 0' }}>
                Calculadora
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#F5F3EF', fontSize: '12px', fontWeight: 400, margin: 0, opacity: 0.8 }}>
                Proyecta tu promedio final
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div style={{ padding: '0 24px 40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {[
          { href: '/calificaciones', label: 'Calificaciones', desc: 'Consulta tus calificaciones del semestre actual por parcial.', icon: '📊' },
          { href: '/kardex', label: 'Kardex', desc: 'Historial académico completo organizado por semestre.', icon: '📋' },
          { href: '/horario', label: 'Horario', desc: 'Visualiza tus clases organizadas por día y horario.', icon: '📅' },
        ].map(({ href, label, desc, icon }) => (
          <a key={href} href={href} style={{ textDecoration: 'none' }}>
            <div
              style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '0.5px solid #E0DDD6', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#162240'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(22,34,64,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E0DDD6'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
            >
              <div style={{ backgroundColor: '#F0F0F0', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px' }}>
                {icon}
              </div>
              <div style={{ padding: '16px' }}>
                <p style={{ fontFamily: "'Inter', sans-serif", color: '#4A8CF5', fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                  Acceso Rápido
                </p>
                <p style={{ fontFamily: "'EB Garamond', serif", color: '#162240', fontSize: '17px', fontWeight: 500, margin: '0 0 6px 0' }}>
                  {label}
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", color: '#666666', fontSize: '12px', fontWeight: 400, margin: 0, lineHeight: '1.5' }}>
                  {desc}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}