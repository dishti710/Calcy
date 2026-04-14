import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation:'default',
      }}
    >
      <Stack.Screen 
        name="calculator" 
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="register" />
      <Stack.Screen name="setPin" />
    </Stack>
  );
}