import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography } from '../../design/tokens';
import { auctionTokens } from '../../design/tokens.auction';
import { colors } from '../../theme';

export type AuctionStatus = 'scheduled' | 'live' | 'ended';

interface AuctionBadgeProps {
  status: AuctionStatus;
  compact?: boolean;
}

export function AuctionBadge({ status, compact = false }: AuctionBadgeProps) {
  const backgroundColor = 
    status === 'live' ? auctionTokens.live :
    status === 'scheduled' ? colors.brand :
    auctionTokens.ended;

  const label = status === 'scheduled' ? 'Upcoming' : status === 'live' ? 'Live' : 'Ended';

  return (
    <View style={[styles.badge, { backgroundColor }, compact && styles.compact]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  compact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
});

