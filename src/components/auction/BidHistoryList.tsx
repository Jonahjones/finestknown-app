import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../../design/tokens';
import { colors } from '../../theme';

interface Bid {
  id: string;
  amountCents: number;
  userDisplay: string;
  createdAt: string;
}

interface BidHistoryListProps {
  bids: Bid[];
  limit?: number;
}

export function BidHistoryList({ bids, limit }: BidHistoryListProps) {
  const displayBids = limit ? bids.slice(0, limit) : bids;

  const renderBid = ({ item }: { item: Bid }) => {
    const formattedPrice = `$${(item.amountCents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const date = new Date(item.createdAt);
    const timeAgo = getTimeAgo(date);

    return (
      <View style={styles.bidItem}>
        <View style={styles.bidLeft}>
          <Text style={styles.userName}>{item.userDisplay}</Text>
          <Text style={styles.timeText}>{timeAgo}</Text>
        </View>
        <Text style={styles.bidAmount}>{formattedPrice}</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={displayBids}
      renderItem={renderBid}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      scrollEnabled={false}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No bids yet</Text>
        </View>
      }
    />
  );
}

function getTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: spacing.xs,
  },
  bidItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bidLeft: {
    flex: 1,
  },
  userName: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  timeText: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    color: colors.text.muted,
  },
  bidAmount: {
    fontSize: typography.heading.size,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.body.size,
    color: colors.text.muted,
  },
});

