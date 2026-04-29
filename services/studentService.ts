interface StudentProfile {
  [key: string]: any;
}

function getTokenFromCookie(): string | null {
  const cookieName = 'sii_token=';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(cookieName) === 0) {
      return decodeURIComponent(cookie.substring(cookieName.length));
    }
  }
  return null;
}

async function authenticatedGet(endpoint: string): Promise<any> {
  const token = getTokenFromCookie();
  if (!token) throw new Error('No token found');
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Token inválido o sesión expirada');
    throw new Error(`Server returned status ${response.status}`);
  }
  return response.json();
}

export async function getStudentProfile(): Promise<StudentProfile> {
  return authenticatedGet('/api/movil/estudiante');
}
export async function getCalificaciones(): Promise<any> {
  return authenticatedGet('/api/movil/estudiante/calificaciones');
}
export async function getKardex(): Promise<any> {
  return authenticatedGet('/api/movil/estudiante/kardex');
}
export async function getHorarios(): Promise<any> {
  return authenticatedGet('/api/movil/estudiante/horarios');
}
