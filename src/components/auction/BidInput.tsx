import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { radius, spacing, typography } from '../../design/tokens';
import { colors } from '../../theme';
import { Button } from '../ui/Button';

interface BidInputProps {
  currentCents: number;
  minIncrementCents?: number;
  onSubmit: (amountCents: number) => void;
  disabled?: boolean;
}

export function BidInput({
  currentCents,
  minIncrementCents = 100,
  onSubmit,
  disabled = false,
}: BidInputProps) {
  const [bidText, setBidText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const bidAmount = parseFloat(bidText);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    const bidCents = Math.round(bidAmount * 100);
    const minBid = currentCents + minIncrementCents;

    if (bidCents < minBid) {
      setError(`Minimum bid: $${(minBid / 100).toFixed(2)}`);
      return;
    }

    setError('');
    onSubmit(bidCents);
    setBidText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, disabled && styles.inputDisabled]}
        value={bidText}
        onChangeText={(text) => {
          setBidText(text);
          setError('');
        }}
        placeholder="Enter bid"
        placeholderTextColor={colors.text.muted}
        keyboardType="decimal-pad"
        editable={!disabled}
        accessibilityLabel="Bid amount input"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Button
        title="Place Bid"
        onPress={handleSubmit}
        disabled={disabled || !bidText}
        variant="primary"
        size="large"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.body.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    minHeight: 44,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  errorText: {
    fontSize: typography.caption.size,
    color: colors.danger,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  button: {
    width: '100%',
  },
});

