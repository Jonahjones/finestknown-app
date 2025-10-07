import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuctionBadge } from '../../src/components/auction/AuctionBadge';
import { CountdownTimer } from '../../src/components/auction/CountdownTimer';
import { radius, spacing, typography } from '../../src/design/tokens';
import { useRealtime } from '../../src/providers/RealtimeProvider';
import { Auction, listAuctions } from '../../src/services/auction';
import { colors, shadow } from '../../src/theme';

// Haptics fallback
const Haptics = {
  impactAsync: async (_style?: any) => {},
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
};

type TabType = 'live' | 'upcoming' | 'closed';

// Skeleton Loader Component
function AuctionCardSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.skeletonImage, { opacity }]} />
      <View style={styles.cardContent}>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonPrice, { opacity }]} />
        <Animated.View style={[styles.skeletonFooter, { opacity }]} />
      </View>
    </View>
  );
}

// Pulsing Live Indicator
function LiveIndicator() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.liveIndicator, { transform: [{ scale: pulseAnim }] }]} />
  );
}

export default function AuctionsScreen() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('live');
  const { subscribe, unsubscribe } = useRealtime();

  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listAuctions();
      setAuctions(data);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchAuctions();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAuctions();
    }, [fetchAuctions])
  );

  // Subscribe to realtime updates for all auctions
  useEffect(() => {
    if (auctions.length === 0) return;

    const handlers: Array<{ channel: string; handler: (payload: any) => void }> = [];

    auctions.forEach((auction) => {
      const channelName = `auctions:${auction.id}`;
      const handler = (payload: { currentCents: number }) => {
        console.log(`[Auction List] Update for ${auction.id}:`, payload.currentCents);
        setAuctions((prev) =>
          prev.map((a) =>
            a.id === auction.id ? { ...a, currentCents: payload.currentCents } : a
          )
        );
      };

      subscribe(channelName, handler);
      handlers.push({ channel: channelName, handler });
    });

    return () => {
      handlers.forEach(({ channel, handler }) => {
        unsubscribe(channel, handler);
      });
    };
  }, [auctions.length, subscribe, unsubscribe]);

  const filteredAuctions = React.useMemo(() => {
    const filtered = auctions.filter((a) => {
      if (activeTab === 'live') return a.status === 'live';
      if (activeTab === 'upcoming') return a.status === 'scheduled';
      if (activeTab === 'closed') return a.status === 'ended';
      return false;
    });

    // Sort appropriately
    if (activeTab === 'closed') {
      return filtered.sort((a, b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime());
    }
    return filtered.sort((a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime());
  }, [auctions, activeTab]);

  const tabCounts = React.useMemo(() => {
    return {
      live: auctions.filter((a) => a.status === 'live').length,
      upcoming: auctions.filter((a) => a.status === 'scheduled').length,
      closed: auctions.filter((a) => a.status === 'ended').length,
    };
  }, [auctions]);

  const handleAuctionPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/auction/${id}` as any);
  };

  const handleTabPress = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const renderAuctionCard = ({ item }: { item: Auction }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    // Mock bid count - in production, would come from API
    const bidCount = Math.floor(Math.random() * 20) + 1;

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleAuctionPress(item.id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={styles.imageWrapper}>
            <Image
              source={{
                uri: item.imageUrl || 'https://via.placeholder.com/300x300/F7F6F3/999?text=No+Image',
              }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              {item.status === 'live' && (
                <View style={styles.liveContainer}>
                  <LiveIndicator />
                </View>
              )}
              <AuctionBadge status={item.status} compact />
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>

            <View style={styles.bidContainer}>
              <Text style={styles.bidLabel}>
                {item.status === 'ended' ? 'Final Price' : 'Current Bid'}
              </Text>
              <Text style={styles.currentBid}>
                ${(item.currentCents / 100).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              {/* Bid count badge */}
              {item.status !== 'ended' && (
                <Text style={styles.bidCountBadge}>{bidCount} bids</Text>
              )}
            </View>

            {item.status !== 'ended' && (
              <View style={styles.footer}>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeIcon}>⏱</Text>
                  <CountdownTimer endAt={item.endAt} />
                </View>
                <View style={styles.bidButtonSmall}>
                  <Text style={styles.bidButtonText}>
                    {item.status === 'live' ? 'Bid' : 'View'}
                  </Text>
                </View>
              </View>
            )}

            {item.status === 'ended' && (
              <View style={styles.footer}>
                <Text style={styles.endedText}>Auction Ended</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Auctions</Text>
        </View>
        <View style={styles.tabBar}>
          <View style={[styles.tab, styles.tabActive]}>
            <Text style={styles.tabTextActive}>🔴 Live</Text>
          </View>
          <View style={styles.tab}>
            <Text style={styles.tabText}>📅 Upcoming</Text>
          </View>
          <View style={styles.tab}>
            <Text style={styles.tabText}>🏁 Closed</Text>
          </View>
        </View>
        <View style={styles.skeletonContainer}>
          <AuctionCardSkeleton />
          <AuctionCardSkeleton />
          <AuctionCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Auctions</Text>
        <Text style={styles.headerSubtitle}>
          {auctions.length} total {auctions.length === 1 ? 'auction' : 'auctions'}
        </Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'live' && styles.tabActive]}
          onPress={() => handleTabPress('live')}
        >
          <Text style={[styles.tabText, activeTab === 'live' && styles.tabTextActive]}>
            🔴 Live
          </Text>
          {tabCounts.live > 0 && (
            <View style={[styles.badge, activeTab === 'live' && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === 'live' && styles.badgeTextActive]}>
                {tabCounts.live}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => handleTabPress('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            📅 Upcoming
          </Text>
          {tabCounts.upcoming > 0 && (
            <View style={[styles.badge, activeTab === 'upcoming' && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === 'upcoming' && styles.badgeTextActive]}>
                {tabCounts.upcoming}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'closed' && styles.tabActive]}
          onPress={() => handleTabPress('closed')}
        >
          <Text style={[styles.tabText, activeTab === 'closed' && styles.tabTextActive]}>
            🏁 Closed
          </Text>
          {tabCounts.closed > 0 && (
            <View style={[styles.badge, activeTab === 'closed' && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === 'closed' && styles.badgeTextActive]}>
                {tabCounts.closed}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={filteredAuctions}
        renderItem={renderAuctionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'live' && 'No live auctions'}
              {activeTab === 'upcoming' && 'No upcoming auctions'}
              {activeTab === 'closed' && 'No closed auctions'}
            </Text>
            <Text style={styles.emptySubtext}>Check back soon for new items</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: typography.body.size,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0654BA',
  },
  tabText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  tabTextActive: {
    fontWeight: typography.weights.bold,
    color: '#0654BA',
  },
  badge: {
    backgroundColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {
    backgroundColor: '#0654BA',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },
  badgeTextActive: {
    color: colors.surface,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  imageWrapper: {
    width: '100%',
    height: 280,
    backgroundColor: '#F7F6F3',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liveContainer: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D32F2F',
  },
  cardContent: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.heading.size,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    minHeight: 48,
  },
  bidContainer: {
    backgroundColor: '#FFF9E6',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#F5A524',
  },
  bidLabel: {
    fontSize: typography.caption.size,
    color: colors.text.secondary,
    marginBottom: 4,
    fontWeight: typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentBid: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    color: '#D32F2F',
  },
  bidCountBadge: {
    fontSize: typography.caption.size,
    color: colors.text.secondary,
    marginTop: 4,
    fontWeight: typography.weights.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#FFF3CD',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  timeIcon: {
    fontSize: 16,
  },
  bidButtonSmall: {
    backgroundColor: '#0654BA',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  bidButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
  endedText: {
    fontSize: typography.body.size,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    paddingVertical: spacing.xxl * 2,
    alignItems: 'center',
    width: '100%',
  },
  emptyText: {
    fontSize: typography.title.size,
    fontWeight: typography.title.weight,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.body.size,
    color: colors.text.muted,
  },
  // Skeleton styles
  skeletonContainer: {
    padding: spacing.md,
  },
  skeletonImage: {
    width: '100%',
    height: 280,
    backgroundColor: colors.border,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.md,
    width: '80%',
  },
  skeletonPrice: {
    height: 32,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.md,
    width: '50%',
  },
  skeletonFooter: {
    height: 40,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '100%',
  },
});
