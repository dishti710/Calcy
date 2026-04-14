import ToggleSwitch from '@/components/ToggleSwitch';
import { COLORS } from '@/constants/colors';
import { getCurrentLocation } from '@/services/location';
import { getLocationHistory, saveLocationHistory } from '@/services/storage';
import { LocationData, LocationHistory } from '@/types';
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

export default function LocationScreen() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareLocationEnabled, setShareLocationEnabled] = useState(true);
  const [backgroundTrackingEnabled, setBackgroundTrackingEnabled] = useState(true);
  const [autoShareOnSOSEnabled, setAutoShareOnSOSEnabled] = useState(true);
  const [saveLocationLogEnabled, setSaveLocationLogEnabled] = useState(false);

  useEffect(() => {
    loadLocationData();
  }, []);

  const loadLocationData = async () => {
    try {
      setIsLoading(true);
      const location = await getCurrentLocation();
      const history = await getLocationHistory();

      setCurrentLocation(location);
      setLocationHistory(history.slice(-10).reverse()); // Last 10 entries
    } catch (error) {
      console.error('Error loading location:', error);
      Alert.alert('Error', 'Failed to load location data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshLocation = async () => {
    try {
      setIsLoading(true);
      const location = await getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        if (saveLocationLogEnabled) {
          await saveLocationHistory({
            ...location,
            safetyRating: 4,
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareLocation = () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    const mapsLink = `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`;
    Alert.alert('Location Link', 'Share this link with someone you trust', [
      {
        text: 'Copy Link',
        onPress: () => {
          // In real app, use react-native-share or Clipboard
          console.log('Link copied:', mapsLink);
        },
      },
      { text: 'Cancel' },
    ]);
  };

  if (isLoading && !currentLocation) {
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
        <Text style={styles.header}>Location</Text>
        <Text style={styles.subHeader}>
          Live tracking · Last updated{' '}
          {currentLocation ? 'just now' : 'never'}
        </Text>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapGrid} />
          <Text style={styles.mapPin}>📍</Text>
          <Text style={styles.mapLabel}>Current Location</Text>
          {currentLocation && (
            <Text style={styles.mapCoords}>
              {currentLocation.latitude.toFixed(4)}° N, {currentLocation.longitude.toFixed(4)}° E
            </Text>
          )}
        </View>

        {/* Location Details */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Location Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Status</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>● Active</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Accuracy</Text>
            <Text style={styles.infoVal}>
                {currentLocation?.accuracy != null
                ? `${Math.round(currentLocation.accuracy)} m`
                : 'N/A'}            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Last Updated</Text>
            <Text style={styles.infoVal}>Just now</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Coordinates</Text>
            <Text style={styles.infoVal}>
              {currentLocation
                ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
                : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Sharing Options */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Location Sharing</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingKey}>Share with contacts</Text>
            <ToggleSwitch
              value={shareLocationEnabled}
              onValueChange={setShareLocationEnabled}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingKey}>Background tracking</Text>
            <ToggleSwitch
              value={backgroundTrackingEnabled}
              onValueChange={setBackgroundTrackingEnabled}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingKey}>SOS auto-share</Text>
            <ToggleSwitch
              value={autoShareOnSOSEnabled}
              onValueChange={setAutoShareOnSOSEnabled}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingKey}>Save location log</Text>
            <ToggleSwitch
              value={saveLocationLogEnabled}
              onValueChange={setSaveLocationLogEnabled}
            />
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity
          style={styles.btnShare}
          onPress={handleShareLocation}
          activeOpacity={0.7}
        >
          <Text style={styles.btnShareText}>📤 Share My Location Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnRefresh}
          onPress={handleRefreshLocation}
          activeOpacity={0.7}
        >
          <Text style={styles.btnRefreshText}>🔄 Refresh Location</Text>
        </TouchableOpacity>

        {/* Location History */}
        {locationHistory.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Location History</Text>
            {locationHistory.map((item, idx) => (
              <View key={idx} style={styles.historyItem}>
                <Text style={styles.historyTime}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
                <Text style={styles.historyCoords}>
                  {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                </Text>
              </View>
            ))}
          </>
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
  mapPlaceholder: {
    backgroundColor: 'linear-gradient(135deg, #e8e4ff, #d4ccff)',
    borderRadius: 20,
    height: 200,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.LAV_200,
    position: 'relative',
    overflow: 'hidden',
  },
  mapGrid: {
    position: 'absolute',
    inset: 0,
    opacity: 0.3,
    backgroundColor: 'repeating-linear-gradient(0deg, rgba(196,181,253,0.3) 1px, transparent 1px, transparent 30px)',
  },
  mapPin: {
    fontSize: 36,
    zIndex: 1,
  },
  mapLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.LAV_700,
    zIndex: 1,
    marginTop: 8,
  },
  mapCoords: {
    fontSize: 11,
    color: COLORS.LAV_500,
    zIndex: 1,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.LAV_100,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.LAV_800,
    marginBottom: 12,
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LAV_50,
  },
  infoKey: {
    fontSize: 12,
    color: COLORS.LAV_500,
  },
  infoVal: {
    fontSize: 12,
    color: COLORS.LAV_800,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    color: '#065f46',
    fontWeight: '600',
  },
  settingRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingKey: {
    fontSize: 13,
    color: COLORS.LAV_800,
  },
  btnShare: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: COLORS.LAV_500,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnShareText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  btnRefresh: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: COLORS.LAV_100,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnRefreshText: {
    color: COLORS.LAV_700,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.LAV_500,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  historyItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.LAV_100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  historyTime: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.LAV_600,
  },
  historyCoords: {
    fontSize: 12,
    color: COLORS.LAV_800,
    marginTop: 2,
  },
  bottomSpacer: {
    height: 20,
  },
});