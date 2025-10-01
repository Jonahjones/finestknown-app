import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../design/tokens';

interface QuantityStepperProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantityStepper({
  value,
  onValueChange,
  min = 1,
  max = 99,
  disabled = false,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (value > min && !disabled) {
      onValueChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max && !disabled) {
      onValueChange(value + 1);
    }
  };

  const canDecrement = value > min && !disabled;
  const canIncrement = value < max && !disabled;

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <TouchableOpacity
        style={[styles.button, styles.decrementButton, !canDecrement && styles.buttonDisabled]}
        onPress={handleDecrement}
        disabled={!canDecrement}
      >
        <Text style={[styles.buttonText, !canDecrement && styles.buttonTextDisabled]}>−</Text>
      </TouchableOpacity>
      
      <View style={styles.valueContainer}>
        <Text style={[styles.value, disabled && styles.valueDisabled]}>{value}</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.button, styles.incrementButton, !canIncrement && styles.buttonDisabled]}
        onPress={handleIncrement}
        disabled={!canIncrement}
      >
        <Text style={[styles.buttonText, !canIncrement && styles.buttonTextDisabled]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.silver,
    backgroundColor: colors.ivory,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  button: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.platinum,
  },
  decrementButton: {
    borderTopLeftRadius: radius.sm - 1,
    borderBottomLeftRadius: radius.sm - 1,
  },
  incrementButton: {
    borderTopRightRadius: radius.sm - 1,
    borderBottomRightRadius: radius.sm - 1,
  },
  buttonDisabled: {
    backgroundColor: colors.silver,
  },
  buttonText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
  },
  buttonTextDisabled: {
    color: colors.textTertiary,
  },
  valueContainer: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.s,
  },
  value: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  valueDisabled: {
    color: colors.textTertiary,
  },
});
