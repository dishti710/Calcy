import { COLORS } from '@/constants/colors';
import { savePIN } from '@/services/storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SetPinScreen() {
  const router = useRouter();
  const [pinInput, setPinInput] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'set' | 'confirm'>('set');
  const [isLoading, setIsLoading] = useState(false);

  const handleNumberPress = (num: string) => {
    if (step === 'set') {
      if (pinInput.length < 4) {
        setPinInput(pinInput + num);
      }
    } else {
      if (confirmPin.length < 4) {
        setConfirmPin(confirmPin + num);
      }
    }
  };

  const handleDelete = () => {
    if (step === 'set') {
      setPinInput(pinInput.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleContinue = async () => {
    if (step === 'set') {
      if (pinInput.length !== 4) {
        Alert.alert('Error', 'PIN must be 4 digits');
        return;
      }
      setStep('confirm');
      return;
    }

    if (confirmPin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }

    if (pinInput !== confirmPin) {
      Alert.alert('Error', 'PINs do not match. Please try again.');
      setPinInput('');
      setConfirmPin('');
      setStep('set');
      return;
    }

    try {
      setIsLoading(true);
      await savePIN(pinInput);
      Alert.alert('Success', 'PIN set successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/home'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to set PIN. Please try again.');
      console.error('Error setting PIN:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const numpadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', ''],
  ];

  const currentPin = step === 'set' ? pinInput : confirmPin;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pinScreen}>
        {/* Icon */}
        <Text style={styles.icon}>🔐</Text>

        {/* Title */}
        <Text style={styles.title}>
          {step === 'set' ? 'Set your secret passcode' : 'Confirm your passcode'}
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          {step === 'set'
            ? "This is what you'll type into the calculator to open the safety app. Choose something memorable but not obvious."
            : "Re-enter your passcode to confirm"}
        </Text>

        {/* PIN Dots */}
        <View style={styles.pinRow}>
          {[0, 1, 2, 3].map((idx) => (
            <View
              key={idx}
              style={[
                styles.pinDot,
                idx < currentPin.length && styles.pinDotFilled,
              ]}
            />
          ))}
        </View>

        {/* Numpad */}
        <View style={styles.numpad}>
          {numpadButtons.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.numpadRow}>
              {row.map((btn, btnIdx) => (
                <TouchableOpacity
                  key={btnIdx}
                  style={[
                    styles.npBtn,
                    btn === '' && styles.npBtnEmpty,
                    btn === '0' && styles.npBtn0,
                  ]}
                  onPress={() => btn && handleNumberPress(btn)}
                  disabled={btn === '' || isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.npBtnText}>{btn}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.npBtnDel}
            onPress={handleDelete}
            disabled={currentPin.length === 0 || isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.npBtnDelText}>⌫</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.btnContinue,
            currentPin.length !== 4 && styles.btnDisabled,
            isLoading && styles.btnDisabled,
          ]}
          onPress={handleContinue}
          disabled={currentPin.length !== 4 || isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>
            {isLoading ? 'Setting up...' : step === 'set' ? 'Next' : 'Complete'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.hint}>Enter any 4 digits for this demo</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6ff',
  },
  pinScreen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.LAV_800,
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: COLORS.LAV_500,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 18,
  },
  pinRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    marginBottom: 24,
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 50,
    backgroundColor: COLORS.LAV_200,
    borderWidth: 2,
    borderColor: COLORS.LAV_300,
  },
  pinDotFilled: {
    backgroundColor: COLORS.LAV_500,
    borderColor: COLORS.LAV_500,
    transform: [{ scale: 1.1 }],
  },
  numpad: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 24,
  },
  numpadRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  npBtn: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.LAV_200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  npBtn0: {
    width: '30%',
  },
  npBtnEmpty: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  npBtnText: {
    fontSize: 20,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '400',
  },
  npBtnDel: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.LAV_200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  npBtnDelText: {
    fontSize: 16,
    color: COLORS.LAV_500,
    fontWeight: '500',
  },
  btnContinue: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: COLORS.LAV_500,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  hint: {
    fontSize: 11,
    color: COLORS.LAV_400,
    textAlign: 'center',
    marginTop: 12,
  },
});