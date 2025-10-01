// src/components/FilterSheet.tsx
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { borderRadius, colors, spacing, typography } from '../design/tokens';

interface FilterOptions {
  metal?: string;
  minPrice?: number;
  maxPrice?: number;
  yearMin?: number;
  yearMax?: number;
  categorySlug?: string;
}

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
}

export function FilterSheet({ visible, onClose, filters, onApplyFilters }: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const metals = ['gold', 'silver', 'platinum', 'palladium'];
  const categories = ['bullion', 'gold', 'silver', 'rare-coins', 'ancients'];

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {};
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetButton}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Metal Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metal</Text>
            <View style={styles.chipContainer}>
              {metals.map((metal) => (
                <TouchableOpacity
                  key={metal}
                  style={[
                    styles.chip,
                    localFilters.metal === metal && styles.chipSelected,
                  ]}
                  onPress={() =>
                    setLocalFilters({
                      ...localFilters,
                      metal: localFilters.metal === metal ? undefined : metal,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.metal === metal && styles.chipTextSelected,
                    ]}
                  >
                    {metal.charAt(0).toUpperCase() + metal.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range ($)</Text>
            <View style={styles.rangeContainer}>
              <TextInput
                style={styles.rangeInput}
                placeholder="Min"
                value={localFilters.minPrice?.toString() || ''}
                onChangeText={(text) =>
                  setLocalFilters({
                    ...localFilters,
                    minPrice: text ? parseInt(text) * 100 : undefined,
                  })
                }
                keyboardType="numeric"
              />
              <Text style={styles.rangeSeparator}>to</Text>
              <TextInput
                style={styles.rangeInput}
                placeholder="Max"
                value={localFilters.maxPrice?.toString() || ''}
                onChangeText={(text) =>
                  setLocalFilters({
                    ...localFilters,
                    maxPrice: text ? parseInt(text) * 100 : undefined,
                  })
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Year Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Year Range</Text>
            <View style={styles.rangeContainer}>
              <TextInput
                style={styles.rangeInput}
                placeholder="From"
                value={localFilters.yearMin?.toString() || ''}
                onChangeText={(text) =>
                  setLocalFilters({
                    ...localFilters,
                    yearMin: text ? parseInt(text) : undefined,
                  })
                }
                keyboardType="numeric"
              />
              <Text style={styles.rangeSeparator}>to</Text>
              <TextInput
                style={styles.rangeInput}
                placeholder="To"
                value={localFilters.yearMax?.toString() || ''}
                onChangeText={(text) =>
                  setLocalFilters({
                    ...localFilters,
                    yearMax: text ? parseInt(text) : undefined,
                  })
                }
                keyboardType="numeric"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate + '20',
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
  },
  cancelButton: {
    color: colors.slate,
    fontSize: typography.sizes.base,
  },
  resetButton: {
    color: colors.navy,
    fontSize: typography.sizes.base,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.slate + '40',
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  chipTextSelected: {
    color: colors.white,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rangeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.slate + '40',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    backgroundColor: colors.white,
  },
  rangeSeparator: {
    color: colors.slate,
    fontSize: typography.sizes.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.slate + '20',
  },
  applyButton: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
});
