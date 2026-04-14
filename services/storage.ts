import { AppSettings, LocationHistory, TrustedContact, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_DATA: '@guardian_user_data',
  PIN: '@guardian_pin',
  CONTACTS: '@guardian_contacts',
  SETTINGS: '@guardian_settings',
  LOCATION_HISTORY: '@guardian_location_history',
  LAST_SOS: '@guardian_last_sos',
  AUDIO_RECORDINGS: '@guardian_audio_recordings',
};

// User Management
export async function saveUserData(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

export async function getUserData(): Promise<User | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading user data:', error);
    return null;
  }
}

// PIN Management
export async function savePIN(pin: string): Promise<void> {
  try {
    // In production, hash this using crypto
    await AsyncStorage.setItem(STORAGE_KEYS.PIN, pin);
  } catch (error) {
    console.error('Error saving PIN:', error);
  }
}

export async function verifyPIN(pin: string): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PIN);
    return stored === pin;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
}

export async function isPINSet(): Promise<boolean> {
  try {
    const pin = await AsyncStorage.getItem(STORAGE_KEYS.PIN);
    return pin !== null;
  } catch (error) {
    return false;
  }
}

// Contacts Management
export async function saveContacts(contacts: TrustedContact[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  } catch (error) {
    console.error('Error saving contacts:', error);
  }
}

export async function getContacts(): Promise<TrustedContact[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading contacts:', error);
    return [];
  }
}

export async function addContact(contact: TrustedContact): Promise<void> {
  const contacts = await getContacts();
  contacts.push(contact);
  await saveContacts(contacts);
}

export async function removeContact(contactId: string): Promise<void> {
  const contacts = await getContacts();
  const filtered = contacts.filter(c => c.id !== contactId);
  await saveContacts(filtered);
}

export async function updateContact(contactId: string, updates: Partial<TrustedContact>): Promise<void> {
  const contacts = await getContacts();
  const index = contacts.findIndex(c => c.id === contactId);
  if (index !== -1) {
    contacts[index] = { ...contacts[index], ...updates };
    await saveContacts(contacts);
  }
}

// Settings Management
export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data
      ? JSON.parse(data)
      : {
          liveLocationEnabled: true,
          voiceListeningEnabled: true,
          shakeSOSEnabled: false,
          silentAlertEnabled: false,
          autoCallEmergency: false,
          locationUpdateInterval: 60000,
          voiceCheckInterval: 5000,
          theme: 'light',
        };
  } catch (error) {
    console.error('Error reading settings:', error);
    return {
      liveLocationEnabled: true,
      voiceListeningEnabled: true,
      shakeSOSEnabled: false,
      silentAlertEnabled: false,
      autoCallEmergency: false,
      locationUpdateInterval: 60000,
      voiceCheckInterval: 5000,
      theme: 'light',
    };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Location History
export async function saveLocationHistory(location: LocationHistory): Promise<void> {
  try {
    const history = await getLocationHistory();
    history.push(location);
    // Keep only last 200 entries
    if (history.length > 200) {
      history.shift();
    }
    await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving location history:', error);
  }
}

export async function getLocationHistory(): Promise<LocationHistory[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading location history:', error);
    return [];
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}