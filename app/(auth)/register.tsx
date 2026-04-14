import { COLORS } from '@/constants/colors';
import { getFirebaseDatabase } from '@/services/firebase';
import { saveUserData } from '@/services/storage';
import { User } from '@/types';
import { useRouter } from 'expo-router';
import { ref, set } from 'firebase/database';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!name.trim() || !age.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (isNaN(Number(age)) || Number(age) < 10 || Number(age) > 120) {
      Alert.alert('Error', 'Please enter a valid age');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    try {
      setIsLoading(true);

      const userId = Date.now().toString();
      const userData: User = {
        id: userId,
        name: name.trim(),
        age: Number(age),
        phone: phone.trim(),
        email: email.trim(),
        createdAt: Date.now(),
      };

      // Save locally
      await saveUserData(userData);

      // Save to Firebase
      const database = getFirebaseDatabase();
      await set(ref(database, `users/${userId}`), userData);

      router.push('/(auth)/setPin');
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Text style={styles.headerIcon}>🛡️</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Guardian Setup</Text>
              <Text style={styles.headerSubtitle}>
                One-time registration · Takes 30 seconds
              </Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={COLORS.LAV_300}
                value={name}
                onChangeText={setName}
                editable={!isLoading}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Your age"
                placeholderTextColor={COLORS.LAV_300}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                editable={!isLoading}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor={COLORS.LAV_300}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@email.com"
                placeholderTextColor={COLORS.LAV_300}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Privacy Note */}
            <View style={styles.privacyNote}>
              <Text style={styles.privacyText}>
                🔒 All data is stored only on your device. Guardian never sends
                your information to external servers without your explicit action.
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
            onPress={handleContinue}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.btnPrimaryText}>
              {isLoading ? 'Loading...' : 'Continue → Set your passcode'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnGhost}
            onPress={handleBack}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.btnGhostText}>← Back to Calculator</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6ff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.LAV_100,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.LAV_800,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.LAV_400,
    marginTop: 2,
  },
  formSection: {
    marginBottom: 16,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    color: COLORS.LAV_600,
    marginBottom: 5,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.LAV_200,
    backgroundColor: '#fff',
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  privacyNote: {
    backgroundColor: COLORS.LAV_50,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14,
  },
  privacyText: {
    fontSize: 11,
    color: COLORS.LAV_500,
    lineHeight: 16,
  },
  btnPrimary: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: COLORS.LAV_500,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  btnGhost: {
    width: '100%',
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: COLORS.LAV_200,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  btnGhostText: {
    color: COLORS.LAV_500,
    fontSize: 14,
    fontWeight: '500',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});