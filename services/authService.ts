/**
 * Login response structure from the API
 */
interface LoginResponse {
  status: number;
  message?: {
    login?: {
      token: string;
    };
  };
}

/**
 * Authenticates a user by sending login credentials to the SII API
 * Uses secure HTTP-only cookies set by the server
 * 
 * @param email - The user's email address
 * @param password - The user's password
 * @returns Promise that resolves with the JWT token
 * @throws Error with specific message for:
 *   - Invalid credentials (401/400)
 *   - Server errors (5xx)
 *   - Network connectivity issues
 *   - Invalid response format
 * 
 * Security considerations:
 * - The token is set as an HTTP-only cookie by the server
 * - Cookie flags: HttpOnly, Secure, SameSite=Lax
 * - Expiration: 5 minutes (300 seconds)
 * - Credentials are transmitted over HTTPS only in production
 */
export async function login(email: string, password: string): Promise<string> {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies in request
      body: JSON.stringify({ email, password }),
    });

    // Handle HTTP error status codes
    if (!response.ok) {
      if (response.status === 401 || response.status === 400) {
        throw new Error('Credenciales inválidas');
      }
      if (response.status >= 500) {
        throw new Error('El servidor no está disponible. Intenta más tarde.');
      }
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data: LoginResponse = await response.json();

    // Validate that the response status is 200
    if (data.status !== 200) {
      throw new Error('Credenciales inválidas');
    }

    // Extract JWT token from the nested response structure
    const token = data.message?.login?.token;
    if (!token) {
      throw new Error('Formato de respuesta inválido: token no encontrado');
    }

    return token;
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw our custom errors as-is
      if (error.message.includes('Credenciales') ||
        error.message.includes('Error del servidor') ||
        error.message.includes('Formato de respuesta') ||
        error.message.includes('no está disponible')) {
        throw error;
      }
      // Handle network errors and timeouts
      throw new Error('Error de conexión o servidor no disponible');
    }
    throw new Error('Ocurrió un error inesperado');
  }
}

/**
 * Logs out the user by clearing the authentication token
 * Notifies all tabs about the logout using BroadcastChannel
 * 
 * @returns void
 */
export function logout(): void {
  // Clear the sii_token cookie
  document.cookie = 'sii_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
  
  // Notify all tabs about logout
  try {
    const channel = new BroadcastChannel('auth');
    channel.postMessage({ type: 'LOGOUT' });
    channel.close();
  } catch (error) {
    // BroadcastChannel not supported, fallback to localStorage
    localStorage.setItem('auth_logout', Date.now().toString());
  }
}

/**
 * Verifies if the user has a valid session token
 * Checks for the presence of the sii_token cookie
 * 
 * @returns boolean - true if a valid token exists, false otherwise
 */
export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes('sii_token=');
}
