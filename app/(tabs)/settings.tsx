import { COLORS } from '@/constants/colors';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>⚙️ Settings Screen</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BG_LIGHT,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.LAV_800,
  },
});