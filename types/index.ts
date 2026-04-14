export interface User {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  createdAt: number;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
  smsOnSOS: boolean;
  locationOnSOS: boolean;
  isPrimary: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
    altitude: number | null
    heading: number | null
    speed: number | null
    accuracy: number | null
  timestamp: number;
}

export interface LocationHistory extends LocationData {
  address?: string;
  safetyRating?: number;
  flags?: string[];
}

export interface SOSAlert {
  id: string;
  userId: string;
  timestamp: number;
  location: LocationData;
  contacts: TrustedContact[];
  audioRecording?: string;
  trigger: 'manual' | 'shake' | 'voice' | 'volume_button';
  status: 'active' | 'resolved' | 'cancelled';
}

export interface AppSettings {
  liveLocationEnabled: boolean;
  voiceListeningEnabled: boolean;
  shakeSOSEnabled: boolean;
  silentAlertEnabled: boolean;
  autoCallEmergency: boolean;
  locationUpdateInterval: number;
  voiceCheckInterval: number;
  theme: 'light' | 'dark';
}

export interface LocationFlag {
  id: string;
  latitude: number;
  longitude: number;
  type: 'unsafe_night' | 'high_crime' | 'poorly_lit' | 'user_report';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: number;
  reportedBy?: string;
}

export interface AudioRecording {
  id: string;
  uri: string;
  duration: number;
  timestamp: number;
  keywordsDetected: string[];
  base64?: string;
}