import { COLORS } from '@/constants/colors';
import { stopAudioRecording } from '@/services/audio';
import { getCurrentLocation } from '@/services/location';
import { getContacts } from '@/services/storage';
import { LocationData, TrustedContact } from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SOSScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [recordingActive, setRecordingActive] = useState(true);

  useEffect(() => {
    loadSOSData();

    // Stop recording after 30 seconds
    const timer = setTimeout(() => {
      setRecordingActive(false);
      stopAudioRecording();
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const loadSOSData = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      const contactList = await getContacts();

      setLocation(currentLocation);
      setContacts(contactList);
    } catch (error) {
      console.error('Error loading SOS data:', error);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel SOS Alert',
      'Are you sure you want to cancel the alert?',
      [
        { text: 'Keep Active' },
        {
          text: 'Cancel Alert',
          onPress: () => {
            router.replace('/(tabs)/home');
          },
        },
      ]
    );
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Call Emergency Services',
      'Dialing 112... (Emergency number)',
      [{ text: 'OK' }]
    );
  };

  const contactNames = contacts.map(c => c.name).join(', ');
  const mapsLink = location
    ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    : 'N/A';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sosAlertScreen}>
        {/* Pulsing Ring */}
        <View style={styles.sosRing}>
          <View style={styles.sosRingInner}>
            <Text style={styles.sosRingEmoji}>🆘</Text>
          </View>
        </View>

        {/* Status */}
        <Text style={styles.sosStatus}>SOS Alert Sent</Text>
        <Text style={styles.sosDetail}>
          Your trusted contacts have been notified with your live location.
          Emergency services info included in the message.
        </Text>

        {/* Info Rows */}
        <View style={styles.sosInfoRow}>
          <Text style={styles.sosInfoLabel}>SMS Sent To</Text>
          <Text style={styles.sosInfoVal}>{contactNames || 'No contacts'}</Text>
        </View>

        <View style={styles.sosInfoRow}>
          <Text style={styles.sosInfoLabel}>Location Shared</Text>
          <Text style={styles.sosInfoVal} numberOfLines={1}>
            {location
              ? `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E`
              : 'Getting location...'}
          </Text>
        </View>

        <View style={styles.sosInfoRow}>
          <Text style={styles.sosInfoLabel}>Voice Recording</Text>
          <Text style={[styles.sosInfoVal, recordingActive && styles.recordingActive]}>
            {recordingActive ? '● Recording in background' : '✓ Recording saved'}
          </Text>
        </View>

        <View style={styles.sosInfoRow}>
          <Text style={styles.sosInfoLabel}>Status</Text>
          <Text style={styles.sosInfoVal}>ACTIVE - Help is on the way</Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.btnCancel}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.btnCancelText}>✓ Cancel · I am safe now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnEmergency}
          onPress={handleEmergencyCall}
          activeOpacity={0.7}
        >
          <Text style={styles.btnEmergencyText}>📞 Call Emergency Services</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Keep this alert active until help arrives or you confirm you're safe
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'linear-gradient(180deg, #2d0a1a, #4c0519)',
  },
  sosAlertScreen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a0010',
  },
  sosRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(251,113,133,0.15)',
    borderWidth: 3,
    borderColor: COLORS.ROSE_400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sosRingInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.ROSE_600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosRingEmoji: {
    fontSize: 32,
  },
  sosStatus: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  sosDetail: {
    fontSize: 13,
    color: COLORS.ROSE_200,
    marginVertical: 10,
    textAlign: 'center',
    lineHeight: 18,
  },
  sosInfoRow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    width: '100%',
  },
  sosInfoLabel: {
    fontSize: 10,
    color: COLORS.ROSE_200,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  sosInfoVal: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    fontWeight: '500',
  },
  recordingActive: {
    color: COLORS.ROSE_200,
  },
  btnCancel: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  btnCancelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  btnEmergency: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: 'rgba(225,29,72,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(225,29,72,0.4)',
    borderRadius: 16,
    alignItems: 'center',
  },
  btnEmergencyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 20,
  },
});