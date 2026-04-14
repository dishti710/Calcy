import {
    startAudioRecording,
    stopAudioRecording,
    uploadRecordingToFirebase
} from '@/services/audio';
import { useCallback, useState } from 'react';

export function useAudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setIsLoading(true);
      const recording = await startAudioRecording();
      if (recording) {
        setIsRecording(true);
        setError(null);
      } else {
        setError('Failed to start recording');
      }
    } catch (err) {
      setError('Error starting recording');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      setIsLoading(true);
      const uri = await stopAudioRecording();
      if (uri) {
        setRecordingUri(uri);
        setIsRecording(false);
        setError(null);
      } else {
        setError('Failed to stop recording');
      }
    } catch (err) {
      setError('Error stopping recording');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadRecording = useCallback(async () => {
    if (!recordingUri) {
      setError('No recording to upload');
      return false;
    }

    try {
      setIsLoading(true);
      const success = await uploadRecordingToFirebase(recordingUri);
      if (success) {
        setError(null);
        setRecordingUri(null);
      } else {
        setError('Failed to upload recording');
      }
      return success;
    } catch (err) {
      setError('Error uploading recording');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [recordingUri]);

  return {
    isRecording,
    isLoading,
    error,
    recordingUri,
    startRecording,
    stopRecording,
    uploadRecording,
  };
}