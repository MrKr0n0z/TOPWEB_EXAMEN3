# 📚 Frontend SII - Portal Estudiantil TecNM Celaya

Sistema web moderno para que estudiantes del Tecnológico Nacional de México, Campus Celaya, consulten su información académica integrada.

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat-square&logo=tailwind-css)

---

## 🎯 Descripción General

**Frontend SII** es un portal estudiantil que conecta a estudiantes con el Sistema de Información Institucional (SII) del TecNM Celaya. Permite a los estudiantes:

- ✅ Autenticarse con credenciales institucionales
- 📊 Visualizar calificaciones por período académico
- 📅 Consultar horario de clases
- 📜 Revisar kardex (historial académico)
- 👤 Acceder a información de perfil estudiantil

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **Next.js** | 16.2.4 | Framework React con App Router |
| **React** | 19.2.4 | Librería de UI |
| **TypeScript** | 5 | Tipado seguro |
| **Tailwind CSS** | 4 | Estilos y diseño responsivo |
| **Node.js** | 18+ | Runtime (recomendado) |

### Backend
- **API Base**: `https://sii.celaya.tecnm.mx/api/`
- **Autenticación**: JWT (Bearer Token)
- **Almacenamiento**: Cookies HTTP-only (`sii_token`)

---

## 📋 Requisitos Previos

- **Node.js**: 18.17 o superior
- **npm**: 9+ o **yarn**: 3+ o **pnpm**: 8+
- Acceso a la API del SII TecNM Celaya

---

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd frontend-sii
```

### 2. Instalar dependencias
```bash
npm install
# o con yarn
yarn install
# o con pnpm
pnpm install
```

### 3. Variables de entorno (si aplica)
Crea un archivo `.env.local` en la raíz del proyecto:
```env
# Configuración de Next.js
NEXT_PUBLIC_API_BASE=https://sii.celaya.tecnm.mx/api/
```

---

## 💻 Desarrollo

### Iniciar servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`

### Compilar para producción
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

---

## 📁 Estructura del Proyecto

```
frontend-sii/
├── app/                          # App Router de Next.js
│   ├── layout.tsx                # Layout raíz
│   ├── page.tsx                  # Página principal
│   ├── globals.css               # Estilos globales
│   │
│   ├── login/
│   │   └── page.tsx              # 🔐 Autenticación de usuarios
│   │
│   ├── dashboard/
│   │   └── page.tsx              # 📊 Panel principal post-login
│   │
│   ├── calificaciones/
│   │   └── page.tsx              # 📈 Historial de calificaciones
│   │
│   ├── horario/
│   │   └── page.tsx              # 📅 Horario de clases
│   │
│   └── kardex/
│       └── page.tsx              # 📜 Historial académico
│
├── hooks/                        # Hooks personalizados
│   ├── useAuth.ts                # Lógica de autenticación
│   └── useProfile.ts             # Carga de datos del perfil
│
├── services/                     # Servicios API
│   ├── authService.ts            # Endpoints de autenticación
│   └── studentService.ts         # Endpoints de estudiante
│
├── public/                       # Activos estáticos
│
├── next.config.ts                # Configuración de Next.js
├── tsconfig.json                 # Configuración de TypeScript
├── tailwind.config.ts            # Configuración de Tailwind
├── postcss.config.mjs            # Configuración de PostCSS
├── eslint.config.mjs             # Reglas de linting
├── proxy.ts                      # Middleware de rutas protegidas
│
└── package.json                  # Dependencias del proyecto
```

---

## 🔐 Autenticación y Rutas

### Rutas Públicas
- `/login` - Formulario de autenticación

### Rutas Protegidas (requieren autenticación)
- `/dashboard` - Panel principal del estudiante
- `/calificaciones` - Calificaciones por período
- `/horario` - Horario de clases
- `/kardex` - Historial académico

### Middleware (`proxy.ts`)
- Redirige usuarios autenticados que acceden `/login` → `/dashboard`
- Redirige usuarios no autenticados que acceden rutas protegidas → `/login`
- Valida y renueva sesión automáticamente

---

## 📡 Servicios API

### `authService.ts` - Autenticación

```typescript
// Login
login(email: string, password: string): Promise<{ token: string }>
```

**Endpoint**: `POST /api/login`

**Ejemplo**:
```typescript
const { token } = await authService.login('estudiante@tecnm.mx', 'contraseña');
// Token guardado automáticamente en cookie sii_token
```

### `studentService.ts` - Datos del Estudiante

```typescript
// Perfil del estudiante
getStudentProfile(): Promise<StudentProfile>

// Calificaciones (por implementar)
getCalificaciones(): Promise<Calificaciones[]>

// Horario (por implementar)
getHorarios(): Promise<Horario[]>

// Kardex (por implementar)
getKardex(): Promise<Kardex>
```

**Autenticación**: Requiere Bearer Token en header
```
Authorization: Bearer {jwt_token}
```

---

## 🪝 Hooks Personalizados

### `useAuth` - Manejo de autenticación

```typescript
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const {
    email,
    password,
    isLoading,
    error,
    handleLogin,
    setEmail,
    setPassword
  } = useAuth();

  return (
    <form onSubmit={handleLogin}>
      <input 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
      />
      <button disabled={isLoading}>
        {isLoading ? 'Autenticando...' : 'Ingresar'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
```

### `useProfile` - Carga de perfil estudiantil

```typescript
import { useProfile } from '@/hooks/useProfile';

export default function Dashboard() {
  const { profileData, isLoading, error } = useProfile();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Bienvenido, {profileData.nombre}</h1>
      <p>Matrícula: {profileData.matricula}</p>
    </div>
  );
}
```

---

## 🎨 Diseño y Estilos

- **Framework**: Tailwind CSS 4
- **Colores Institucionales**: Verde TecNM (#162240)
- **Tipografía**: Fuente Geist (incluida en layout)
- **Tema**: Modo oscuro por defecto con soporte a modo claro
- **Responsivo**: 100% mobile-first compatible

---

## 🔧 Configuración Clave

### Next.js (`next.config.ts`)
```typescript
// Proxy inverso de API para evitar CORS
rewrites: {
  beforeFiles: [
    {
      source: '/api/:path*',
      destination: 'https://sii.celaya.tecnm.mx/api/:path*'
    }
  ]
}
```

### TypeScript (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]  // Alias para importes: @/hooks, @/services
    },
    "strict": true
  }
}
```

---

## 📝 Notas de Desarrollo

### ⚠️ Cambios en Next.js 16
Esta versión de Next.js tiene cambios significativos respecto a versiones anteriores:
- App Router es el estándar (sin Pages Router)
- Cambios en APIs de middleware
- Nuevas convenciones de layout

Revisar: `AGENTS.md` para más detalles sobre breaking changes.

### 🔄 Flujo de Autenticación
1. Usuario accede `/login`
2. Ingresa credenciales
3. `useAuth.handleLogin()` → `authService.login()`
4. Si es exitoso, token se guarda en cookie `sii_token`
5. Middleware redirige a `/dashboard`
6. `useProfile()` carga datos automáticamente
7. Para logout, se limpia la cookie

### 🛠️ Funciones Pendientes
Las siguientes funciones en `studentService.ts` aún necesitan implementación:
- `getCalificaciones()`
- `getHorarios()`
- `getKardex()`

Estas funciones se importan en sus respectivas páginas pero retornan datos mock.

---

## 📚 Recursos Útiles

- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación React 19](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 👥 Contribuciones

Para contribuir al proyecto:

1. Crea una rama para tu feature: `git checkout -b feature/mi-feature`
2. Realiza tus cambios y commit: `git commit -m 'Agregar mi-feature'`
3. Push a la rama: `git push origin feature/mi-feature`
4. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es propiedad del Tecnológico Nacional de México, Campus Celaya.

---

## 📞 Contacto y Soporte

Para reportar problemas o sugerencias sobre el portal:
- Email: [contacto@celaya.tecnm.mx]
- Sistema SII: https://sii.celaya.tecnm.mx/

---

**Última actualización**: Abril 2026  
**Versión**: 0.1.0  
**Estado**: En desarrollo
