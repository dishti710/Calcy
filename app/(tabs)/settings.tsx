import { COLORS } from '@/constants/colors';
import { clearAllData, getSettings, getUserData } from '@/services/storage';
import { AppSettings, User } from '@/types';
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
    View
} from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const userData = await getUserData();
      const settingsData = await getSettings();

      setUser(userData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockApp = () => {
    Alert.alert('Lock App', 'Return to calculator view?', [
      { text: 'Cancel' },
      {
        text: 'Lock',
        onPress: () => {
          router.replace('/(auth)/calculator');
        },
      },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your app data. This action cannot be undone.',
      [
        { text: 'Cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              await clearAllData();
              router.replace('/(auth)/calculator');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  if (isLoading || !settings) {
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
        <Text style={styles.header}>Settings</Text>
        <Text style={styles.subHeader}>Manage your Guardian preferences</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileDetail}>Age {user?.age} · {user?.email}</Text>
            <Text style={styles.profileDetail}>{user?.phone}</Text>
          </View>
        </View>

        {/* Security Section */}
        <Text style={styles.sectionLabel}>Security</Text>
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, styles.iconLav]}>
              <Text style={styles.settingIconText}>🔑</Text>
            </View>
            <View>
              <Text style={styles.settingTitle}>Change Passcode</Text>
              <Text style={styles.settingSub}>Update your calculator unlock code</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, styles.iconLav]}>
              <Text style={styles.settingIconText}>🎭</Text>
            </View>
            <View>
              <Text style={styles.settingTitle}>Disguise Skin</Text>
              <Text style={styles.settingSub}>Currently: Calculator</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, styles.iconRose]}>
              <Text style={styles.settingIconText}>🚨</Text>
            </View>
            <View>
              <Text style={styles.settingTitle}>SOS Triggers</Text>
              <Text style={styles.settingSub}>Shake, voice, volume button</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* AI Section */}
        <Text style={styles.sectionLabel}>AI & Voice</Text>
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, styles.iconLav]}>
              <Text style={styles.settingIconText}>🧠</Text>
            </View>
            <View>
              <Text style={styles.settingTitle}>AI Keywords</Text>
              <Text style={styles.settingSub}>Manage trigger words</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, styles.iconMint]}>
              <Text style={styles.settingIconText}>🎙️</Text>
            </View>
            <View>
              <Text style={styles.settingTitle}>Voice Sensitivity</Text>
              <Text style={styles.settingSub}>Currently: High</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, styles.iconLav]}>
              <Text style={styles.settingIconText}>🎧</Text>
            </View>
            <View>
              <Text style={styles.settingTitle}>Audio Log Storage</Text>
              <Text style={styles.settingSub}>Keep recordings for 7 days</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, styles.iconAmber]}>
              <Text style={styles.settingIconText}>🔔</Text>
            </View>
            <View>
              <Text style={styles.settingTitle}>Alert Confirmation</Text>
              <Text style={styles.settingSub}>Vibration + silent notification</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, styles.iconLav]}>
              <Text style={styles.settingIconText}>📱</Text>
            </View>
            <View>
              <Text style={styles.settingTitle}>Check-in Reminders</Text>
              <Text style={styles.settingSub}>Currently: Off</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, styles.iconLav]}>
              <Text style={styles.settingIconText}>📤</Text>
            </View>
            <View>
              <Text style={styles.settingTitle}>Export My Data</Text>
              <Text style={styles.settingSub}>Download logs and settings</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleLockApp}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, styles.iconRose]}>
              <Text style={styles.settingIconText}>🔒</Text>
            </View>
            <View>
              <Text style={styles.settingTitle}>Lock App</Text>
              <Text style={styles.settingSub}>Return to calculator view</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRowDanger}
          onPress={handleClearData}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, styles.iconRoseDanger]}>
              <Text style={styles.settingIconText}>🗑️</Text>
            </View>
            <View>
              <Text style={styles.settingTitleDanger}>Clear All Data</Text>
              <Text style={styles.settingSubDanger}>Delete all app data</Text>
            </View>
          </View>
          <Text style={styles.chevronDanger}>›</Text>
        </TouchableOpacity>

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
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.LAV_800,
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 12,
    color: COLORS.LAV_400,
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: `linear-gradient(135deg, ${COLORS.LAV_500}, ${COLORS.LAV_700})`,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  profileDetail: {
    fontSize: 12,
    color: COLORS.LAV_200,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.LAV_500,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.LAV_100,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 2,
  },
  settingRowDanger: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff5f5',
    borderWidth: 1.5,
    borderColor: '#fecaca',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 2,
  },
  settingLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconText: {
    fontSize: 16,
  },
  iconLav: {
    backgroundColor: COLORS.LAV_100,
  },
  iconRose: {
    backgroundColor: '#fff5f5',
  },
  iconMint: {
    backgroundColor: '#ecfdf5',
  },
  iconAmber: {
    backgroundColor: '#fffbeb',
  },
  iconRoseDanger: {
    backgroundColor: '#fecaca',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.LAV_800,
  },
  settingTitleDanger: {
    fontSize: 14,
    fontWeight: '500',
    color: '#b91c1c',
  },
  settingSub: {
    fontSize: 11,
    color: COLORS.LAV_400,
    marginTop: 2,
  },
  settingSubDanger: {
    fontSize: 11,
    color: '#dc2626',
    marginTop: 2,
  },
  chevron: {
    color: COLORS.LAV_300,
    fontSize: 14,
  },
  chevronDanger: {
    color: '#fecaca',
    fontSize: 14,
  },
  bottomSpacer: {
    height: 20,
  },
});