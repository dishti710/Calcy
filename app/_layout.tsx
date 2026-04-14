import { initializeFirebase } from '@/services/firebase';
import { registerForPushNotifications, setupNotificationHandlers } from '@/services/notifications';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    try {
      // Initialize Firebase
      initializeFirebase();
      console.log('✅ Firebase initialized');

      // Setup notifications
      registerForPushNotifications();
      setupNotificationHandlers();
      console.log('✅ Notifications setup complete');
    } catch (error) {
      console.error('❌ Initialization error:', error);
    }
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
          animation:'default',
      }}
    >
      <Stack.Screen 
        name="(auth)" 
        options={{
          animation:'default',
        }}
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{
          animation:'default',
        }}
      />
    </Stack>
  );
}