import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return finalStatus;
  } catch (error) {
    console.error('Error registering for notifications:', error);
    return null;
  }
}

export async function sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        badge: 1,
      },
        trigger: {
        type: 'timeInterval',
        seconds: 1,
        },  
      });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
}

export async function sendSOSNotification(contactName: string, location: string): Promise<void> {
  try {
    await sendLocalNotification(
      '🆘 SOS Alert Sent',
      `Alert sent to ${contactName}. Location: ${location}`,
      { type: 'sos_sent' }
    );
  } catch (error) {
    console.error('Error sending SOS notification:', error);
  }
}

export function setupNotificationHandlers(): void {
  // Handle notification received while app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
  });

  // Handle notification taps
  Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification response:', response);
  });
}