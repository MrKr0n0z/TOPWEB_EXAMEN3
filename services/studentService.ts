/**
 * Student profile response structure from the API
 */
interface StudentProfile {
  [key: string]: any; // API response structure
}

/**
 * Retrieves the JWT token from the browser cookies
 * @returns The JWT token value or null if not found
 */
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

/**
 * Fetches the student profile from the API
 * Requires a valid JWT token stored in the 'sii_token' cookie
 * @returns Promise that resolves with the student profile data
 * @throws Error if token is missing or session is expired
 */
export async function getStudentProfile(): Promise<StudentProfile> {
  // Retrieve JWT token from cookie
  const token = getTokenFromCookie();

  if (!token) {
    throw new Error('No token found');
  }

  try {
    const response = await fetch('/api/movil/estudiante', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle authentication errors
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Token inválido o sesión expirada');
      }
      throw new Error(`Server returned status ${response.status}`);
    }

    // Parse and return the JSON response
    const studentProfile: StudentProfile = await response.json();
    return studentProfile;
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw our custom errors as-is
      if (
        error.message.includes('No token found') ||
        error.message.includes('Token inválido o sesión expirada') ||
        error.message.includes('Server returned status')
      ) {
        throw error;
      }
      // Handle network errors and timeouts
      throw new Error('Network error or server unavailable');
    }
    throw new Error('An unexpected error occurred');
  }
}
