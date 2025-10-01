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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const threeDays = new Date(today);
    threeDays.setDate(threeDays.getDate() + 3);
    
    const oneWeek = new Date(today);
    oneWeek.setDate(oneWeek.getDate() + 7);
    
    const twoWeeks = new Date(today);
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    
    const oneMonth = new Date(today);
    oneMonth.setDate(oneMonth.getDate() + 30);
    
    const threeMonths = new Date(today);
    threeMonths.setDate(threeMonths.getDate() + 90);
    
    // Show alert with preset options
    Alert.alert(
      'Select Date',
      'Choose a preset date or enter custom:',
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
          text: '3 Days', 
          onPress: () => onChangeText(formatDate(threeDays))
        },
        { 
          text: '1 Week', 
          onPress: () => onChangeText(formatDate(oneWeek))
        },
        { 
          text: '2 Weeks', 
          onPress: () => onChangeText(formatDate(twoWeeks))
        },
        { 
          text: '1 Month', 
          onPress: () => onChangeText(formatDate(oneMonth))
        },
        { 
          text: '3 Months', 
          onPress: () => onChangeText(formatDate(threeMonths))
        },
        {
          text: 'Custom Date',
          onPress: () => showCustomDateInput()
        }
      ]
    );
  };

  const showCustomDateInput = () => {
    Alert.prompt(
      'Enter Custom Date',
      'Format: YYYY-MM-DD (e.g., 2025-12-31)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set',
          onPress: (input?: string) => {
            if (input && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
              const inputDate = parseDate(input);
              if (minimumDate && inputDate < minimumDate) {
                Alert.alert('Invalid Date', 'Date cannot be before the minimum date');
                return;
              }
              if (maximumDate && inputDate > maximumDate) {
                Alert.alert('Invalid Date', 'Date cannot be after the maximum date');
                return;
              }
              onChangeText(input);
            } else {
              Alert.alert('Invalid Format', 'Please use YYYY-MM-DD format');
            }
          }
        }
      ],
      'plain-text',
      value || formatDate(new Date())
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
