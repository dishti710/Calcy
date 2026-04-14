import { initializeFirebase } from '@/services/firebase';
import { registerForPushNotifications, setupNotificationHandlers } from '@/services/notifications';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    // Initialize Firebase
    initializeFirebase();

    // Setup notifications
    registerForPushNotifications();
    setupNotificationHandlers();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'default',
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}