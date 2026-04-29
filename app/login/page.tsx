'use client';

import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { email, setEmail, password, setPassword, error, isLoading, handleLogin } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap');
      `}</style>

      <div style={{ minHeight: '100vh', backgroundImage: 'url(/images/login.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        {/* Navbar */}
        <nav style={{ backgroundColor: '#162240', height: '64px', display: 'flex', alignItems: 'center', paddingLeft: '24px', gap: '12px' }}>
          <img src="/images/logo-itc.png" alt="ITC Logo" style={{ height: '48px', width: 'auto' }} />
          <h1 style={{ fontFamily: "'EB Garamond', serif", color: '#F5F3EF', fontSize: '24px', fontWeight: 500, letterSpacing: '0.5px', margin: 0 }}>
            SII - TecNM en Celaya
          </h1>
        </nav>

        {/* Login Container */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', padding: '24px', backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          {/* Login Card */}
          <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '0.5px solid #E0DDD6', overflow: 'hidden' }}>
            {/* Card Header */}
            <div style={{ backgroundColor: '#162240', padding: '32px 24px', textAlign: 'center' }}>
              <h2 style={{ fontFamily: "'EB Garamond', serif", color: '#F5F3EF', fontSize: '28px', fontWeight: 500, letterSpacing: '0.5px', margin: 0, marginBottom: '8px' }}>
                Inicio de Sesión
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#F5F3EF', fontSize: '13px', fontWeight: 400, margin: 0, opacity: 0.9 }}>
                Ingresa tus credenciales
              </p>
            </div>

            {/* Card Body */}
            <form onSubmit={handleSubmit} style={{ padding: '32px 24px' }}>
              {/* Email Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontFamily: "'Inter', sans-serif", display: 'block', color: '#162240', fontSize: '12px', fontWeight: 500, marginBottom: '8px', letterSpacing: '0.3px' }}>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="tu.email@institución.edu.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '13px',
                    fontWeight: 400,
                    color: '#162240',
                    border: '0.5px solid #E0DDD6',
                    borderRadius: '7px',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#162240')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#E0DDD6')}
                />
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontFamily: "'Inter', sans-serif", display: 'block', color: '#162240', fontSize: '12px', fontWeight: 500, marginBottom: '8px', letterSpacing: '0.3px' }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '13px',
                    fontWeight: 400,
                    color: '#162240',
                    border: '0.5px solid #E0DDD6',
                    borderRadius: '7px',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#162240')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#E0DDD6')}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#FEE2E2', border: '0.5px solid #FECACA', borderRadius: '7px' }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", color: '#991B1B', fontSize: '12px', fontWeight: 500, margin: 0, letterSpacing: '0.3px' }}>
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#F5F3EF',
                  backgroundColor: isLoading ? '#4B5563' : '#162240',
                  border: 'none',
                  borderRadius: '7px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  letterSpacing: '0.5px',
                  opacity: isLoading ? 0.8 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#0F1923';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isLoading ? '#4B5563' : '#162240';
                }}
              >
                {isLoading ? 'Loading...' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Card Footer */}
            <div style={{ padding: '0 24px 24px 24px', textAlign: 'center', borderTop: '0.5px solid #E0DDD6' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#666666', fontSize: '12px', fontWeight: 400, margin: 0, letterSpacing: '0.3px' }}>
                ¿Problemas con tu acceso?{' '}
                <a href="#" style={{ color: '#162240', textDecoration: 'none', fontWeight: 500 }}>
                  Contacta soporte
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
