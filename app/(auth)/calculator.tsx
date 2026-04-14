import { COLORS } from '@/constants/colors';
import { STRINGS } from '@/constants/strings';
import { verifyPIN } from '@/services/storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const SECRET_PIN = '1234'; // Demo PIN

export default function CalculatorScreen() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [expression, setExpression] = useState('');
  const [lastOperator, setLastOperator] = useState('');

  const handlePress = (val: string) => {
    if (val === 'AC') {
      setInput('');
      setExpression('');
      setLastOperator('');
      return;
    }

    if (val === '+/-') {
      if (input) {
        setInput(input.startsWith('-') ? input.slice(1) : '-' + input);
      }
      return;
    }

    if (val === '%') {
      if (input) {
        const percent = String(parseFloat(input) / 100);
        setInput(percent);
      }
      return;
    }

    if (val === '=') {
      handleEquals();
      return;
    }

    if (['÷', '×', '+', '-'].includes(val)) {
      if (input) {
        setExpression(input + ' ' + val + ' ');
        setLastOperator(val);
        setInput('');
      }
      return;
    }

    if (val === '.' && input.includes('.')) return;

    setInput(input + val);
  };

  const handleEquals = async () => {
    // Check if it's the secret PIN
    if (input === SECRET_PIN) {
      try {
        // Verify PIN exists
        const isValid = await verifyPIN(input);
        if (isValid || input === SECRET_PIN) {
          // For demo, accept any 4-digit entry
          router.replace('/(tabs)/home');
          return;
        }
      } catch (error) {
        console.error('Error verifying PIN:', error);
      }
    }

    // Normal calculator operation
    if (expression && input) {
      try {
        let expr = expression + input;
        expr = expr
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-');

        // Safe evaluation
        const result = Function('"use strict"; return (' + expr + ')')();
        const rounded = Math.round(result * 1e10) / 1e10;

        setExpression(expr + ' =');
        setInput(String(rounded));
        setLastOperator('');
      } catch (e) {
        setInput('Error');
      }
    }
  };

  const buttons = [
    ['AC', '+/-', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.display}>
        <Text style={styles.label}>Calculator</Text>
        <Text style={styles.expression}>{expression}</Text>
        <Text style={styles.number}>{input || '0'}</Text>
      </View>

      <View style={styles.grid}>
        {buttons.map((row, rowIdx) =>
          row.map((btn) => (
            <TouchableOpacity
              key={btn}
              style={[
                styles.btn,
                btn === '=' && styles.btnEq,
                ['÷', '×', '+', '-', '%', '+/-', 'AC'].includes(btn) &&
                  styles.btnOp,
                btn === '0' && styles.btnZero,
              ]}
              onPress={() => handlePress(btn)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.btnText,
                  btn === '=' && styles.btnTextEq,
                  ['÷', '×', '+', '-', '%', '+/-', 'AC'].includes(btn) &&
                    styles.btnTextOp,
                ]}
              >
                {btn}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <Text style={styles.hint}>{STRINGS.CALCULATOR_HINT}</Text>
      <Text style={styles.demo}>{STRINGS.PASSCODE_DEMO}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_LIGHT,
  },
  display: {
    backgroundColor: COLORS.BG_DARK,
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    minHeight: 180,
  },
  label: {
    color: COLORS.LAV_300,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  expression: {
    color: COLORS.LAV_400,
    fontSize: 14,
    marginTop: 4,
    minHeight: 20,
  },
  number: {
    color: '#fff',
    fontSize: 52,
    fontWeight: '200',
    marginTop: 8,
    letterSpacing: -2,
    lineHeight: 60,
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    backgroundColor: COLORS.LAV_200,
  },
  btn: {
    width: '25%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f6ff',
    borderWidth: 0.5,
    borderColor: COLORS.LAV_200,
  },
  btnOp: {
    backgroundColor: COLORS.LAV_50,
  },
  btnEq: {
    backgroundColor: COLORS.LAV_500,
  },
  btnZero: {
    width: '50%',
  },
  btnText: {
    fontSize: 20,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '400',
  },
  btnTextOp: {
    color: COLORS.LAV_700,
    fontWeight: '500',
  },
  btnTextEq: {
    color: '#fff',
    fontWeight: '500',
  },
  hint: {
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 11,
    color: COLORS.LAV_400,
    backgroundColor: COLORS.BG_LIGHT,
  },
  demo: {
    textAlign: 'center',
    paddingBottom: 16,
    fontSize: 11,
    color: COLORS.LAV_500,
    backgroundColor: COLORS.BG_LIGHT,
  },
});