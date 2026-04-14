import { COLORS } from '@/constants/colors';
import { getUserData } from '@/services/storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getUserData();
      setUser(userData);
      console.log('✅ User loaded:', userData?.name);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.LAV_500} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>👋 Hello, {user?.name || 'User'}</Text>

        <TouchableOpacity
          style={styles.sosCard}
          onPress={() => {
            console.log('🚨 SOS Triggered');
            router.push('/(app)/sos');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.sosText}>🆘 SOS Alert</Text>
          <Text style={styles.sosSubText}>Tap for emergency help</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push('/(app)/location')}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>📍 View Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push('/(app)/contacts')}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>👥 Manage Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push('/(app)/settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_LIGHT,
  },
  content: {
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.LAV_800,
    marginBottom: 24,
  },
  sosCard: {
    backgroundColor: COLORS.ROSE_600,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  sosText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  sosSubText: {
    fontSize: 14,
    color: COLORS.ROSE_200,
    marginTop: 4,
  },
  btn: {
    backgroundColor: COLORS.LAV_500,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});