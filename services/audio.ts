import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { push, ref, set } from 'firebase/database';
import { getFirebaseDatabase } from './firebase';
import { getUserData } from './storage';

let recordingObject: Audio.Recording | null = null;
let recordingUri: string | null = null;

export async function requestAudioPermission(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting audio permission:', error);
    return false;
  }
}

export async function startAudioRecording(): Promise<Audio.Recording | null> {
  try {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      console.error('Audio permission denied');
      return null;
    }

    // ✅ FIXED: Set audio mode correctly
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
    } catch (e) {
      // Fallback if method doesn't exist
      console.warn('setAudioModeAsync not available, continuing anyway');
    }

    const recording = new Audio.Recording();
    
    // ✅ Prepare with correct preset
    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    
    await recording.startAsync();
    recordingObject = recording;
    
    console.log('🎙️ Audio recording started');
    return recording;
  } catch (error) {
    console.error('Error starting audio recording:', error);
    return null;
  }
}

export async function stopAudioRecording(): Promise<string | null> {
  try {
    if (!recordingObject) {
      console.warn('No active recording');
      return null;
    }

    await recordingObject.stopAndUnloadAsync();
    const uri = recordingObject.getURI();

    recordingUri = uri;
    recordingObject = null;

    console.log('✅ Audio recording stopped:', uri);
    return uri;
  } catch (error) {
    console.error('Error stopping audio recording:', error);
    return null;
  }
}

export async function uploadRecordingToFirebase(recordingUri: string): Promise<boolean> {
  try {
    const user = await getUserData();
    if (!user) {
      console.error('No user data available');
      return false;
    }

    const fileData = await FileSystem.readAsStringAsync(recordingUri, {
        encoding: 'base64' 
    });

    const database = getFirebaseDatabase();
    const recordingRef = push(ref(database, `recordings/${user.id}`));

    await set(recordingRef, {
      audioBase64: fileData,
      timestamp: Date.now(),
      fileName: `recording_${Date.now()}.wav`,
      duration: 0,
    });

    console.log('✅ Recording uploaded to Firebase');
    return true;
  } catch (error) {
    console.error('Error uploading recording to Firebase:', error);
    return false;
  }
}

export async function getRecordingUri(): Promise<string | null> {
  return recordingUri;
}

export async function deleteRecording(uri: string): Promise<boolean> {
  try {
    await FileSystem.deleteAsync(uri);
    console.log('✅ Recording deleted');
    return true;
  } catch (error) {
    console.error('Error deleting recording:', error);
    return false;
  }
}

export async function isRecording(): Promise<boolean> {
  if (!recordingObject) return false;

  try {
    const status = await recordingObject.getStatusAsync();
    return status?.isRecording ?? false;
  } catch (error) {
    return false;
  }
}