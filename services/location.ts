import { LocationData } from '@/types';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { ref, update } from 'firebase/database';
import { getFirebaseDatabase } from './firebase';
import { getUserData, saveLocationHistory } from './storage';

const LOCATION_TASK_NAME = 'background-location-task';

// Define background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    if (locations && locations.length > 0) {
      const location = locations[locations.length - 1];
      
      try {
        const user = await getUserData();
        if (user) {
          // Save to Firebase
          const database = getFirebaseDatabase();
          await update(ref(database, `locations/${user.id}`), {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
            accuracy: location.coords.accuracy,
          });

          // Save to local history
          await saveLocationHistory({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
            heading: location.coords.heading,
            speed: location.coords.speed,
            timestamp: location.timestamp,
          });
        }
      } catch (err) {
        console.error('Error processing background location:', err);
      }
    }
  }
});

export async function startBackgroundLocation(): Promise<boolean> {
  try {
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (fgStatus !== 'granted') {
      console.error('Foreground location permission denied');
      return false;
    }

    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    
    if (bgStatus !== 'granted') {
      console.error('Background location permission denied');
      return false;
    }

    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (!isRunning) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 60000, // Update every 1 minute
        distanceInterval: 10, // Or every 10 meters
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: '🛡️ Guardian Active',
          notificationBody: 'Location tracking enabled',
        },
      });
    }

    console.log('✅ Background location started');
    return true;
  } catch (error) {
    console.error('Error starting background location:', error);
    return false;
  }
}

export async function stopBackgroundLocation(): Promise<boolean> {
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('✅ Background location stopped');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error stopping background location:', error);
    return false;
  }
}

export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.error('Location permission not granted');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      altitude: location.coords.altitude,
      heading: location.coords.heading,
      speed: location.coords.speed,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

export async function getLocationPermissions(): Promise<{
  foreground: boolean;
  background: boolean;
}> {
  try {
    const fgStatus = await Location.getForegroundPermissionsAsync();
    const bgStatus = await Location.getBackgroundPermissionsAsync();

    return {
      foreground: fgStatus.status === 'granted',
      background: bgStatus.status === 'granted',
    };
  } catch (error) {
    console.error('Error checking location permissions:', error);
    return { foreground: false, background: false };
  }
}

export function getLocationTaskName(): string {
  return LOCATION_TASK_NAME;
}