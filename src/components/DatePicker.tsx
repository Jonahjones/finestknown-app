import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [showModal, setShowModal] = useState(false);
  const [customDateInput, setCustomDateInput] = useState('');

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

  const handlePresetDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    onChangeText(formatDate(date));
    setShowModal(false);
  };

  const handleCustomDate = () => {
    if (!customDateInput) {
      Alert.alert('Error', 'Please enter a date');
      return;
    }
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(customDateInput)) {
      Alert.alert('Invalid Format', 'Please use YYYY-MM-DD format (e.g., 2025-12-31)');
      return;
    }
    
    const inputDate = parseDate(customDateInput);
    
    if (minimumDate && inputDate < minimumDate) {
      Alert.alert('Invalid Date', 'Date cannot be before the minimum date');
      return;
    }
    
    if (maximumDate && inputDate > maximumDate) {
      Alert.alert('Invalid Date', 'Date cannot be after the maximum date');
      return;
    }
    
    onChangeText(customDateInput);
    setCustomDateInput('');
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.input} onPress={() => setShowModal(true)}>
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? getDisplayValue() : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Date Picker Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.navy} />
              </TouchableOpacity>
            </View>

            <View style={styles.presetSection}>
              <Text style={styles.sectionTitle}>Quick Select</Text>
              <View style={styles.presetGrid}>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetDate(0)}>
                  <Text style={styles.presetButtonText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetDate(1)}>
                  <Text style={styles.presetButtonText}>Tomorrow</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetDate(3)}>
                  <Text style={styles.presetButtonText}>3 Days</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetDate(7)}>
                  <Text style={styles.presetButtonText}>1 Week</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetDate(14)}>
                  <Text style={styles.presetButtonText}>2 Weeks</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetDate(30)}>
                  <Text style={styles.presetButtonText}>1 Month</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetDate(90)}>
                  <Text style={styles.presetButtonText}>3 Months</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetDate(180)}>
                  <Text style={styles.presetButtonText}>6 Months</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.customSection}>
              <Text style={styles.sectionTitle}>Custom Date</Text>
              <Text style={styles.helperText}>Format: YYYY-MM-DD (e.g., 2025-12-31)</Text>
              <TextInput
                style={styles.customInput}
                value={customDateInput}
                onChangeText={setCustomDateInput}
                placeholder="2025-12-31"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numbers-and-punctuation"
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleCustomDate}>
                <Text style={styles.submitButtonText}>Set Custom Date</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.ivory,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  modalTitle: {
    fontSize: typography.title.size,
    fontWeight: typography.title.weight,
    color: colors.navy,
  },
  presetSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
    marginBottom: spacing.m,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  presetButton: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  presetButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.medium,
    color: colors.ivory,
  },
  customSection: {
    borderTopWidth: 1,
    borderTopColor: colors.platinum,
    paddingTop: spacing.l,
  },
  helperText: {
    fontSize: typography.caption.size,
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  customInput: {
    borderWidth: 1,
    borderColor: colors.silver,
    borderRadius: radius.md,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    fontSize: typography.body.size,
    color: colors.navy,
    backgroundColor: colors.ivory,
    marginBottom: spacing.m,
  },
  submitButton: {
    backgroundColor: colors.gold,
    paddingVertical: spacing.m,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
  },
});
