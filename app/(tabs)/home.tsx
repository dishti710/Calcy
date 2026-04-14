import ToggleSwitch from '@/components/ToggleSwitch';
import { COLORS } from '@/constants/colors';
import { startAudioRecording, stopAudioRecording } from '@/services/audio';
import { getCurrentLocation } from '@/services/location';
import { sendEmergencySMS } from '@/services/sms';
import { getContacts, getSettings, getUserData } from '@/services/storage';
import { LocationData, TrustedContact, User } from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingSOS, setIsProcessingSOS] = useState(false);
  const [liveLocationEnabled, setLiveLocationEnabled] = useState(true);
  const [voiceListeningEnabled, setVoiceListeningEnabled] = useState(true);
  const [shakeSOSEnabled, setShakeSOSEnabled] = useState(false);
  const [silentAlertEnabled, setSilentAlertEnabled] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const userData = await getUserData();
      const contactsData = await getContacts();
      const settingsData = await getSettings();
      const currentLocation = await getCurrentLocation();

      setUser(userData);
      setContacts(contactsData);
      setLocation(currentLocation);
      setLiveLocationEnabled(settingsData.liveLocationEnabled);
      setVoiceListeningEnabled(settingsData.voiceListeningEnabled);
      setShakeSOSEnabled(settingsData.shakeSOSEnabled);
      setSilentAlertEnabled(settingsData.silentAlertEnabled);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSOSAlert = async () => {
    if (contacts.length === 0) {
      Alert.alert('No Contacts', 'Please add trusted contacts first', [
        {
          text: 'Add Contact',
          onPress: () => router.push('/(tabs)/contacts'),
        },
        { text: 'Cancel' },
      ]);
      return;
    }

    try {
      setIsProcessingSOS(true);

      // Get current location
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        Alert.alert('Error', 'Could not get your location');
        return;
      }

      // Start recording
      if (voiceListeningEnabled) {
        await startAudioRecording();
      }

      // Send emergency SMS
      await sendEmergencySMS(currentLocation);

      // Navigate to SOS screen
      router.push('/(tabs)/sos');

      // Stop recording after 30 seconds
      if (voiceListeningEnabled) {
        setTimeout(async () => {
          await stopAudioRecording();
        }, 30000);
      }
    } catch (error) {
      console.error('Error handling SOS:', error);
      Alert.alert('Error', 'Failed to send SOS alert');
    } finally {
      setIsProcessingSOS(false);
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hi, {user?.name?.split(' ')[0] || 'User'} 👋
            </Text>
            <Text style={styles.subGreeting}>You are safe · Location active</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Protected</Text>
          </View>
        </View>

        {/* SOS Card */}
        <TouchableOpacity
          style={styles.sosCard}
          onPress={handleSOSAlert}
          disabled={isProcessingSOS}
          activeOpacity={0.8}
        >
          <Text style={styles.sosLabel}>Emergency Trigger</Text>
          <Text style={styles.sosTitle}>SOS Alert</Text>
          <Text style={styles.sosSub}>
            {isProcessingSOS
              ? 'Sending alert...'
              : 'Tap to send emergency alert to your contacts'}
          </Text>
          <View style={styles.sosActions}>
            <View style={styles.sosBtn}>
              <Text style={styles.sosBtnText}>📍 Share Location</Text>
            </View>
            <View style={styles.sosBtn}>
              <Text style={styles.sosBtnText}>🎙️ Record</Text>
            </View>
            <View style={styles.sosBtn}>
              <Text style={styles.sosBtnText}>📞 Alert</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Features */}
        <Text style={styles.sectionTitle}>Protection Features</Text>
        <View style={styles.featuresGrid}>
          <View style={styles.featCard}>
            <View style={styles.featToggleRow}>
              <Text style={styles.featIcon}>📍</Text>
              <ToggleSwitch
                value={liveLocationEnabled}
                onValueChange={setLiveLocationEnabled}
              />
            </View>
            <Text style={styles.featTitle}>Live Location</Text>
            <Text style={styles.featSub}>Background GPS tracking</Text>
          </View>

          <View style={styles.featCard}>
            <View style={styles.featToggleRow}>
              <Text style={styles.featIcon}>🎙️</Text>
              <ToggleSwitch
                value={voiceListeningEnabled}
                onValueChange={setVoiceListeningEnabled}
              />
            </View>
            <Text style={styles.featTitle}>Voice Listen</Text>
            <Text style={styles.featSub}>AI keyword detection</Text>
          </View>

          <View style={styles.featCard}>
            <View style={styles.featToggleRow}>
              <Text style={styles.featIcon}>📳</Text>
              <ToggleSwitch
                value={shakeSOSEnabled}
                onValueChange={setShakeSOSEnabled}
              />
            </View>
            <Text style={styles.featTitle}>Shake SOS</Text>
            <Text style={styles.featSub}>3× shake triggers alert</Text>
          </View>

          <View style={styles.featCard}>
            <View style={styles.featToggleRow}>
              <Text style={styles.featIcon}>🔕</Text>
              <ToggleSwitch
                value={silentAlertEnabled}
                onValueChange={setSilentAlertEnabled}
              />
            </View>
            <Text style={styles.featTitle}>Silent Alert</Text>
            <Text style={styles.featSub}>No sound when triggered</Text>
          </View>
        </View>

        {/* AI Status */}
        <View style={styles.aiChip}>
          <Text style={styles.aiText}>✦ AI active · Listening for emergency keywords</Text>
        </View>

        {/* Quick Contacts */}
        <Text style={styles.sectionTitle}>Trusted Contacts</Text>
        {contacts.length > 0 ? (
          <>
            {contacts.slice(0, 2).map((contact) => (
              <View key={contact.id} style={styles.contactRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {contact.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactNum}>
                    {contact.phone} · Gets SMS + location
                  </Text>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addContactBtn}
              onPress={() => router.push('/(tabs)/contacts')}
              activeOpacity={0.7}
            >
              <Text style={styles.addContactText}>+ Add trusted contact</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.addContactBtnLarge}
            onPress={() => router.push('/(tabs)/contacts')}
            activeOpacity={0.7}
          >
            <Text style={styles.addContactLargeIcon}>➕</Text>
            <Text style={styles.addContactLargeText}>Add your first trusted contact</Text>
            <Text style={styles.addContactLargeSub}>They'll receive your SOS alerts</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6ff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.LAV_800,
  },
  subGreeting: {
    fontSize: 12,
    color: COLORS.LAV_400,
    marginTop: 2,
    fontWeight: '400',
  },
  statusPill: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: COLORS.MINT_200,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 50,
    backgroundColor: COLORS.MINT_400,
  },
  statusText: {
    fontSize: 11,
    color: '#065f46',
    fontWeight: '500',
  },
  sosCard: {
    backgroundColor: COLORS.LAV_600,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  sosLabel: {
    fontSize: 10,
    color: COLORS.LAV_200,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  sosTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginVertical: 4,
    letterSpacing: -0.5,
  },
  sosSub: {
    fontSize: 12,
    color: COLORS.LAV_300,
    marginBottom: 12,
  },
  sosActions: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  sosBtn: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    alignItems: 'center',
  },
  sosBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.LAV_500,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuresGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  featCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.LAV_100,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  featToggleRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  featIcon: {
    fontSize: 22,
  },
  featTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.LAV_800,
  },
  featSub: {
    fontSize: 11,
    color: COLORS.LAV_400,
    marginTop: 3,
  },
  aiChip: {
    backgroundColor: 'linear-gradient(90deg, #f5f3ff, #fce7f3)',
    borderWidth: 1,
    borderColor: COLORS.LAV_200,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  aiText: {
    fontSize: 11,
    color: COLORS.LAV_700,
    fontWeight: '500',
  },
  contactRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.LAV_100,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 50,
    backgroundColor: COLORS.LAV_100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.LAV_700,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.LAV_800,
  },
  contactNum: {
    fontSize: 11,
    color: COLORS.LAV_400,
    marginTop: 2,
  },
  addContactBtn: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.LAV_50,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.LAV_300,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  addContactText: {
    color: COLORS.LAV_500,
    fontSize: 13,
    fontWeight: '500',
  },
  addContactBtnLarge: {
    backgroundColor: COLORS.LAV_50,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.LAV_300,
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  addContactLargeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  addContactLargeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.LAV_500,
  },
  addContactLargeSub: {
    fontSize: 11,
    color: COLORS.LAV_400,
    marginTop: 4,
  },
  bottomSpacer: {
    height: 20,
  },
});