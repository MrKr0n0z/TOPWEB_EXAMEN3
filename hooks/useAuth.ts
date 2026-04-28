'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/services/authService';

/**
 * Custom hook for authentication
 * Manages login state and handles user authentication flow
 */
export function useAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Sets a secure cookie with the provided name, value, and expiration days
   */
  const setCookie = (name: string, value: string, days: number) => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    const cookieValue = encodeURIComponent(value);
    const cookieString = `${name}=${cookieValue}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;

    document.cookie = cookieString;
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
      setError('Email is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      // Call the login service
      const token = await login(email, password);

      // Save JWT token to cookie with 1-day expiration
      setCookie('sii_token', token, 1);

      // Clear form fields on successful login
      setEmail('');
      setPassword('');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      // Handle and set error message
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleLogin,
  };
}
