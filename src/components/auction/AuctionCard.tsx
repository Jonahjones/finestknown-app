import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { radius, spacing, typography } from '../../design/tokens';
import { colors, shadow } from '../../theme';
import { AuctionBadge, AuctionStatus } from './AuctionBadge';
import { CountdownTimer } from './CountdownTimer';
import { LivePriceTicker } from './LivePriceTicker';

interface AuctionCardProps {
  id: string;
  title: string;
  imageUrl: string;
  currentCents: number;
  endAt: string;
  status: AuctionStatus;
  onPress: () => void;
}

export function AuctionCard({
  id,
  title,
  imageUrl,
  currentCents,
  endAt,
  status,
  onPress,
}: AuctionCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityLabel={`Auction: ${title}`}
    >
      <View style={styles.card}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl || 'https://via.placeholder.com/400x300/F7F6F3/C8A34A?text=No+Image' }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Badge overlay top-right */}
          <View style={styles.badgeOverlay}>
            <AuctionBadge status={status} compact />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          {/* Bottom row: Timer and Price */}
          <View style={styles.bottomRow}>
            <CountdownTimer endAt={endAt} />
            <LivePriceTicker amountCents={currentCents} status={status} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.border,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.heading.size,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.weight,
    color: colors.text.primary,
    minHeight: 48,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

