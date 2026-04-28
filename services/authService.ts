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
 * @param email - The user's email address
 * @param password - The user's password
 * @returns Promise that resolves with the JWT token
 * @throws Error with specific message for invalid credentials, server downtime, or invalid response
 */
export async function login(email: string, password: string): Promise<string> {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Handle HTTP error status codes
    if (!response.ok) {
      if (response.status === 401 || response.status === 400) {
        throw new Error('Invalid credentials provided');
      }
      throw new Error(`Server returned status ${response.status}`);
    }

    const data: LoginResponse = await response.json();

    // Validate that the response status is 200
    if (data.status !== 200) {
      throw new Error('Invalid credentials provided');
    }

    // Extract JWT token from the nested response structure
    const token = data.message?.login?.token;
    if (!token) {
      throw new Error('Invalid response format: token not found');
    }

    return token;
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw our custom errors as-is
      if (
        error.message.includes('Invalid credentials') ||
        error.message.includes('Server returned status') ||
        error.message.includes('Invalid response format')
      ) {
        throw error;
      }
      // Handle network errors and timeouts
      throw new Error('Server downtime or network error');
    }
    throw new Error('An unexpected error occurred');
  }
}
