import { COLORS } from '@/constants/colors';
import { startBackgroundLocation } from '@/services/location';
import { getUserData } from '@/services/storage';
import { Tabs, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function AppLayout() {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getUserData();
      if (!user) {
        router.replace('/(auth)/calculator');
        return;
      }

      // Start background location tracking
      await startBackgroundLocation();
      setIsInitialized(true);
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/(auth)/calculator');
    }
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.LAV_600,
        tabBarInactiveTintColor: COLORS.LAV_300,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: COLORS.LAV_100,
          paddingVertical: 10,
          paddingBottom: 14,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 3,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          title: 'Location',
          tabBarLabel: 'Location',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📍</Text>,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarLabel: 'Contacts',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          href: null, // Hide from tab bar - accessed via button
        }}
      />
    </Tabs>
  );
}

import { Text } from 'react-native';
