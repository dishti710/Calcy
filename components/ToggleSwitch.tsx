import { COLORS } from '@/constants/colors';
import {
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function ToggleSwitch({
  value,
  onValueChange,
}: ToggleSwitchProps) {
  return (
    <TouchableOpacity
      style={[styles.toggle, value && styles.toggleOn]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.8}
    >
      <View style={[styles.toggleDot, value && styles.toggleDotOn]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.LAV_200,
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleOn: {
    backgroundColor: COLORS.LAV_500,
  },
  toggleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    position: 'absolute',
    left: 4,
    top: 4,
  },
  toggleDotOn: {
    left: 20,
  },
});