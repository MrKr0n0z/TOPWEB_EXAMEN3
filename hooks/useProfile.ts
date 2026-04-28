'use client';

import { useState, useEffect } from 'react';
import { getStudentProfile } from '@/services/studentService';

/**
 * Custom hook to fetch and manage student profile data
 * Automatically loads the profile on component mount
 */
export function useProfile() {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fetch student profile on component mount
     */
    const fetchProfile = async () => {
      try {
        const data = await getStudentProfile();
        setProfileData(data);
        setIsLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []); // Empty dependency array ensures this runs only once on mount

  return {
    profileData,
    isLoading,
    error,
  };
}
