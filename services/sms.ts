import { LocationData } from '@/types';
import { Alert } from 'react-native';
import { getContacts } from './storage';

// For production, integrate with a backend SMS service like Twilio
export async function sendEmergencySMS(location: LocationData): Promise<boolean> {
  try {
    const contacts = await getContacts();
    
    if (!contacts || contacts.length === 0) {
      Alert.alert('No Contacts', 'Please add trusted contacts first');
      return false;
    }

    const mapsLink = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    const message = `🆘 EMERGENCY ALERT
I may be in danger. Please check on me.
📍 Location: ${mapsLink}
📞 Call me or contact authorities if I don't respond.
— Guardian App`;

    console.log('📱 Emergency SMS would be sent to contacts');
    console.log('Message:', message);

    // TODO: Integrate with backend SMS service
    // For now, this logs the message
    
    return true;
  } catch (error) {
    console.error('Error sending emergency SMS:', error);
    return false;
  }
}

export async function sendTestSMS(contactId: string): Promise<boolean> {
  try {
    const contacts = await getContacts();
    const contact = contacts.find(c => c.id === contactId);

    if (!contact) {
      Alert.alert('Contact Not Found');
      return false;
    }

    const testMessage = '✅ This is a test message from Guardian Safety App';

    console.log(`📱 Test SMS would be sent to ${contact.name} (${contact.phone})`);
    console.log('Message:', testMessage);

    // TODO: Integrate with backend SMS service
    
    return true;
  } catch (error) {
    console.error('Error sending test SMS:', error);
    return false;
  }
}

export function getEmergencySMSPreview(userName: string): string {
  return `🆘 EMERGENCY ALERT from ${userName}
I may be in danger. Please check on me.
📍 My location: [Location Link]
📞 Call me or contact authorities if I don't respond.
— Sent via Guardian App`;
}