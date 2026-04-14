import { getUserData, isPINSet, savePIN, verifyPIN } from '@/services/storage';
import { User } from '@/types';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPIN, setHasPIN] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  async function initAuth() {
    try {
      const userData = await getUserData();
      const pinExists = await isPINSet();
      
      setUser(userData);
      setHasPIN(pinExists);
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyUserPIN(pin: string): Promise<boolean> {
    try {
      return await verifyPIN(pin);
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  }

  async function setPIN(pin: string): Promise<boolean> {
    try {
      await savePIN(pin);
      setHasPIN(true);
      return true;
    } catch (error) {
      console.error('Error setting PIN:', error);
      return false;
    }
  }

  return {
    user,
    isLoading,
    hasPIN,
    verifyUserPIN,
    setPIN,
  };
}