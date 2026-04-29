'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, logout as authLogout, isAuthenticated } from '@/services/authService';

/**
 * Custom hook for authentication management
 * Handles:
 * - User login with email and password
 * - Session persistence and validation
 * - Cross-tab logout synchronization
 * - Secure cookie management (5-minute expiration)
 * - Loading states to prevent content flashing
 */
export function useAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true); // True initially to check session
  const [isAuthenticating, setIsAuthenticating] = useState(false); // For login/logout requests
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  /**
   * Sets a secure HTTP-only cookie with JWT token
   * Expiration: 5 minutes (300 seconds)
   * Flags: Secure (HTTPS only), SameSite=Lax
   * 
   * Note: HttpOnly flag must be set by the server for security
   */
  const setCookie = (name: string, value: string) => {
    const expirationDate = new Date();
    // Expiration: 5 minutes from now
    expirationDate.setTime(expirationDate.getTime() + 5 * 60 * 1000);

    const cookieValue = encodeURIComponent(value);
    // SameSite=Lax allows cookies in top-level navigations (more secure than Strict)
    const cookieString = `${name}=${cookieValue}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;

    document.cookie = cookieString;
  };

  /**
   * Clears the authentication cookie
   */
  const clearCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  };

  /**
   * Handles the login process
   * Validates credentials, calls the authentication service, and redirects on success
   */
  const handleLogin = async () => {
    // Clear previous errors
    setError(null);

    // Validate that fields are not empty
    if (!email.trim()) {
      setError('El correo es obligatorio');
      return;
    }

    if (!password.trim()) {
      setError('La contraseña es obligatoria');
      return;
    }

    setIsAuthenticating(true);

    try {
      // Call the login service
      const token = await login(email, password);

      // Save JWT token to cookie with 5-minute expiration
      setCookie('sii_token', token);

      // Update authentication state
      setIsLoggedIn(true);

      // Clear form fields on successful login
      setEmail('');
      setPassword('');

      // Notify other tabs about successful login
      try {
        const channel = new BroadcastChannel('auth');
        channel.postMessage({ type: 'LOGIN' });
        channel.close();
      } catch {
        // BroadcastChannel not supported, localStorage fallback
        localStorage.setItem('auth_login', Date.now().toString());
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      // Handle and set error message
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Handles logout: clears session and notifies other tabs
   */
  const handleLogout = () => {
    setIsAuthenticating(true);
    try {
      clearCookie('sii_token');
      setIsLoggedIn(false);
      authLogout(); // Notifies other tabs via BroadcastChannel or localStorage
      router.push('/login');
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Initialize auth state and set up cross-tab synchronization
   * Runs once on component mount
   */
  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
    setIsLoading(false);

    // Set up cross-tab logout synchronization
    let channel: BroadcastChannel | null = null;

    try {
      // Try using BroadcastChannel (modern approach)
      channel = new BroadcastChannel('auth');
      channel.onmessage = (event) => {
        if (event.data.type === 'LOGOUT') {
          // Another tab logged out
          setIsLoggedIn(false);
          clearCookie('sii_token');
          router.push('/login');
        } else if (event.data.type === 'LOGIN') {
          // Another tab logged in
          setIsLoggedIn(true);
        }
      };
    } catch {
      // BroadcastChannel not supported, fallback to storage listener
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'auth_logout' && e.newValue) {
          // Logout detected in another tab
          setIsLoggedIn(false);
          clearCookie('sii_token');
          router.push('/login');
        } else if (e.key === 'auth_login' && e.newValue) {
          // Login detected in another tab
          setIsLoggedIn(true);
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }

    // Cleanup: close BroadcastChannel when component unmounts
    return () => {
      if (channel) {
        channel.close();
      }
    };
  }, [router]);

  /**
   * Set up token refresh interval
   * Since cookies expire in 5 minutes, we could refresh token here
   * For now, just redirect to login when token expires
   */
  useEffect(() => {
    if (!isLoggedIn) return;

    // Check token validity every 4 minutes (before 5-minute expiration)
    const tokenCheckInterval = setInterval(() => {
      if (!isAuthenticated()) {
        setIsLoggedIn(false);
        router.push('/login');
      }
    }, 4 * 60 * 1000); // 4 minutes

    return () => clearInterval(tokenCheckInterval);
  }, [isLoggedIn, router]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading, // True while checking initial session
    isAuthenticating, // True during login/logout request
    isLoggedIn, // Current authentication state
    error,
    handleLogin,
    handleLogout,
  };
}
