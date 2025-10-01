import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadow, spacing, type } from '../../theme';

interface PriceTickerItem {
  label: string;
  value: string;
  change?: string;
}

interface PriceTickerProps {
  items: PriceTickerItem[];
}

export function PriceTicker({ items }: PriceTickerProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {items.map((item, index) => (
        <View key={index} style={styles.pill}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{item.value}</Text>
            {item.change && (
              <Text style={[
                styles.change, 
                item.change.startsWith('+') ? styles.changePositive : styles.changeNegative
              ]}>
                {item.change}
              </Text>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  pill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadow.card,
    minWidth: 120,
  },
  label: {
    ...type.meta,
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  value: {
    ...type.title,
    color: colors.text.primary,
  },
  change: {
    ...type.meta,
    fontSize: 11,
  },
  changePositive: {
    color: colors.success,
  },
  changeNegative: {
    color: colors.danger,
  },
});

