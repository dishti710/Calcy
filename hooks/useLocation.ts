import {
    getCurrentLocation,
    startBackgroundLocation,
    stopBackgroundLocation,
} from '@/services/location';
import { LocationData } from '@/types';
import { useCallback, useState } from 'react';

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = useCallback(async () => {
    try {
      setIsLoading(true);
      const success = await startBackgroundLocation();
      if (success) {
        setIsTracking(true);
        setError(null);
      } else {
        setError('Failed to start location tracking');
      }
    } catch (err) {
      setError('Error starting location tracking');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopTracking = useCallback(async () => {
    try {
      setIsLoading(true);
      const success = await stopBackgroundLocation();
      if (success) {
        setIsTracking(false);
        setError(null);
      }
    } catch (err) {
      setError('Error stopping location tracking');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentLocation = await getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        setError(null);
      } else {
        setError('Could not fetch current location');
      }
    } catch (err) {
      setError('Error fetching location');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    location,
    isLoading,
    error,
    isTracking,
    startTracking,
    stopTracking,
    fetchCurrentLocation,
  };
}