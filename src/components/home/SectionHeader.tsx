import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, type } from '../../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  onCtaPress?: () => void;
}

export function SectionHeader({ title, subtitle, ctaText, onCtaPress }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {ctaText && onCtaPress && (
        <TouchableOpacity onPress={onCtaPress} style={styles.cta}>
          <Text style={styles.ctaText}>{ctaText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...type.h2,
    color: colors.text.primary,
  },
  subtitle: {
    ...type.meta,
    marginTop: spacing.xs,
  },
  cta: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  ctaText: {
    ...type.body,
    color: colors.brand,
    fontWeight: '700',
  },
});

