import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../design/tokens';

interface DatePickerProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

export function DatePicker({ 
  value, 
  onChangeText, 
  placeholder = "YYYY-MM-DD", 
  label,
  minimumDate,
  maximumDate 
}: DatePickerProps) {
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getDisplayValue = () => {
    if (!value) return '';
    try {
      const date = parseDate(value);
      return date.toLocaleDateString();
    } catch {
      return value;
    }
  };

  const showDateInput = () => {
    // For now, let's use a simple approach that works on all platforms
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Set default dates based on context
    let defaultStart = value || formatDate(today);
    let defaultEnd = formatDate(nextWeek);
    
    if (minimumDate) {
      defaultStart = formatDate(minimumDate);
    }
    
    // Show a simple alert with options
    Alert.alert(
      'Select Date',
      'Choose a date option:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Today', 
          onPress: () => onChangeText(formatDate(today))
        },
        { 
          text: 'Tomorrow', 
          onPress: () => onChangeText(formatDate(tomorrow))
        },
        { 
          text: 'Next Week', 
          onPress: () => onChangeText(formatDate(nextWeek))
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.input} onPress={showDateInput}>
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? getDisplayValue() : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  label: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.medium,
    color: colors.navy,
    marginBottom: spacing.s,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderWidth: 1,
    borderColor: colors.silver,
    borderRadius: radius.md,
    backgroundColor: colors.ivory,
  },
  text: {
    fontSize: typography.body.size,
    color: colors.navy,
    flex: 1,
  },
  placeholder: {
    color: colors.textSecondary,
  },
});
