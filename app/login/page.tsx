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

      <div style={{ backgroundColor: '#F5F3EF', minHeight: '100vh' }}>
        {/* Navbar */}
        <nav style={{ backgroundColor: '#16401c', height: '64px', display: 'flex', alignItems: 'center', paddingLeft: '24px' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginRight: '12px' }}>
            <rect width="32" height="32" fill="#F5F3EF" rx="4" />
            <path
              d="M16 8C11.58 8 8 11.58 8 16C8 20.42 11.58 24 16 24C20.42 24 24 20.42 24 16C24 11.58 20.42 8 16 8ZM16 22C12.68 22 10 19.32 10 16C10 12.68 12.68 10 16 10C19.32 10 22 12.68 22 16C22 19.32 19.32 22 16 22Z"
              fill="#162240"
            />
            <path d="M16 12C14.34 12 13 13.34 13 15V17C13 18.66 14.34 20 16 20C17.66 20 19 18.66 19 17V15C19 13.34 17.66 12 16 12Z" fill="#16401c" />
          </svg>
          <h1 style={{ fontFamily: "'EB Garamond', serif", color: '#F5F3EF', fontSize: '24px', fontWeight: 500, letterSpacing: '0.5px', margin: 0 }}>
            Portal Estudiante TecNM
          </h1>
        </nav>

        {/* Login Container */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', padding: '24px' }}>
          {/* Login Card */}
          <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '0.5px solid #E0DDD6', overflow: 'hidden' }}>
            {/* Card Header */}
            <div style={{ backgroundColor: '#16401c', padding: '32px 24px', textAlign: 'center' }}>
              <h2 style={{ fontFamily: "'EB Garamond', serif", color: '#F5F3EF', fontSize: '28px', fontWeight: 500, letterSpacing: '0.5px', margin: 0, marginBottom: '8px' }}>
                Acceso
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
                  backgroundColor: isLoading ? '#4B5563' : '#16401c',
                  border: 'none',
                  borderRadius: '7px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  letterSpacing: '0.5px',
                  opacity: isLoading ? 0.8 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#0D2612';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isLoading ? '#4B5563' : '#16401c';
                }}
              >
                {isLoading ? 'Loading...' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Card Footer */}
            <div style={{ padding: '0 24px 24px 24px', textAlign: 'center', borderTop: '0.5px solid #E0DDD6' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#666666', fontSize: '12px', fontWeight: 400, margin: 0, letterSpacing: '0.3px' }}>
                ¿Problemas con tu acceso?{' '}
                <a href="#" style={{ color: '#16401c', textDecoration: 'none', fontWeight: 500 }}>
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
