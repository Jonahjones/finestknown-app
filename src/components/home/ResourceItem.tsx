import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, shadow, spacing, type } from '../../theme';

interface ResourceItemProps {
  title: string;
  description?: string;
  onPress: () => void;
}

export function ResourceItem({ title, description, onPress }: ResourceItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.8}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description} numberOfLines={2}>{description}</Text>}
      </View>
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Read</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.brand} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    ...shadow.card,
  },
  content: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...type.title,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    ...type.meta,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  linkText: {
    ...type.body,
    color: colors.brand,
    fontWeight: '700',
  },
});

