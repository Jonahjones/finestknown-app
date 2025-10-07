import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadow, spacing, type } from '../../theme';

interface ProofItem {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color: string;
}

export function SocialProofBanner() {
  const proofItems: ProofItem[] = [
    { icon: 'star', text: '5-Star Rated', color: '#FFD700' },
    { icon: 'people', text: '10K+ Customers', color: colors.success },
    { icon: 'earth', text: '50+ Countries', color: '#4A90E2' },
    { icon: 'cash', text: '$10M+ Sold', color: colors.brand },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {proofItems.map((item, index) => (
          <View key={index} style={styles.pill}>
            <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon} size={16} color={item.color} />
            </View>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...type.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
});

