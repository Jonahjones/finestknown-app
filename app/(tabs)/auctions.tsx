import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuctionBadge } from '../../src/components/auction/AuctionBadge';
import { CountdownTimer } from '../../src/components/auction/CountdownTimer';
import { radius, spacing, typography } from '../../src/design/tokens';
import { supabase } from '../../src/lib/supabase';
import { useRealtime } from '../../src/providers/RealtimeProvider';
import { Auction, listAuctions, listBids } from '../../src/services/auction';
import { colors, shadow } from '../../src/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Haptics fallback
const Haptics = {
  impactAsync: async (_style?: any) => {},
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
};

type TabType = 'live' | 'upcoming' | 'mywins';
type SortType = 'ending' | 'highest' | 'newest';

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

// Pulsing Badge for Live Tab
function PulsingBadge({ count, active }: { count: number; active: boolean }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[
      styles.badge,
      active && styles.badgeActiveLive,
      { transform: [{ scale: pulseAnim }] }
    ]}>
      <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
        {count}
      </Text>
    </Animated.View>
  );
}

export default function AuctionsScreen() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('live');
  const [sortBy, setSortBy] = useState<SortType>('ending');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userWins, setUserWins] = useState<Set<string>>(new Set());
  const { subscribe, unsubscribe } = useRealtime();
  
  // Animations
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    });
  }, []);

  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listAuctions();
      setAuctions(data);
      
      // Fetch user wins if logged in
      if (currentUserId) {
        const wins = new Set<string>();
        await Promise.all(
          data.map(async (auction) => {
            try {
              const bidsData = await listBids(auction.id);
              if (bidsData.length > 0 && bidsData[0].userId === currentUserId && auction.status === 'ended') {
                wins.add(auction.id);
              }
            } catch (err) {
              console.error('Error fetching bids for auction:', auction.id, err);
            }
          })
        );
        setUserWins(wins);
      }
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

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
    let filtered = auctions.filter((a) => {
      if (activeTab === 'live') return a.status === 'live';
      if (activeTab === 'upcoming') return a.status === 'scheduled';
      if (activeTab === 'mywins') return userWins.has(a.id);
      return false;
    });

    // Apply sorting
    if (sortBy === 'ending') {
      filtered = filtered.sort((a, b) => 
        activeTab === 'mywins' 
          ? new Date(b.endAt).getTime() - new Date(a.endAt).getTime()
          : new Date(a.endAt).getTime() - new Date(b.endAt).getTime()
      );
    } else if (sortBy === 'highest') {
      filtered = filtered.sort((a, b) => b.currentCents - a.currentCents);
    } else if (sortBy === 'newest') {
      filtered = filtered.sort((a, b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime());
    }

    return filtered;
  }, [auctions, activeTab, sortBy, userWins]);

  const tabCounts = React.useMemo(() => {
    return {
      live: auctions.filter((a) => a.status === 'live').length,
      upcoming: auctions.filter((a) => a.status === 'scheduled').length,
      mywins: userWins.size,
    };
  }, [auctions, userWins]);

  // Calculate stats
  const stats = React.useMemo(() => {
    const liveAuctions = auctions.filter(a => a.status === 'live');
    const endingSoon = liveAuctions.filter(a => {
      const timeLeft = new Date(a.endAt).getTime() - Date.now();
      return timeLeft < 3600000; // Less than 1 hour
    });
    
    // Calculate wins total
    const winsTotal = Array.from(userWins).reduce((sum, auctionId) => {
      const auction = auctions.find(a => a.id === auctionId);
      return sum + (auction?.currentCents || 0);
    }, 0);
    
    return {
      liveCount: liveAuctions.length,
      endingSoonCount: endingSoon.length,
      winsTotal,
      winsCount: userWins.size,
      nextAuction: auctions
        .filter(a => a.status === 'scheduled')
        .sort((a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime())[0],
    };
  }, [auctions, userWins]);

  const handleAuctionPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/auction/${id}` as any);
  };

  const handleTabPress = (tab: TabType) => {
    if (tab === activeTab) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Fade out content
    Animated.timing(contentFadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      
      // Animate tab indicator
      const tabIndex = tab === 'live' ? 0 : tab === 'upcoming' ? 1 : 2;
      Animated.spring(tabIndicatorAnim, {
        toValue: tabIndex,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
      
      // Fade in content
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const renderAuctionCard = ({ item }: { item: Auction }) => {
    // Mock bid count - in production, would come from API
    const bidCount = Math.floor(Math.random() * 20) + 1;
    
    // Check if ending soon
    const timeLeft = new Date(item.endAt).getTime() - Date.now();
    const isEndingSoon = item.status === 'live' && timeLeft < 3600000;
    
    // Check if this is a win
    const isWin = userWins.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isEndingSoon && styles.cardEndingSoon,
          isWin && styles.cardWin,
        ]}
        onPress={() => handleAuctionPress(item.id)}
        activeOpacity={0.8}
      >
        {isEndingSoon && (
          <View style={styles.endingSoonBanner}>
            <Ionicons name="flash" size={16} color="#D32F2F" />
            <Text style={styles.endingSoonText}>ENDING SOON</Text>
          </View>
        )}
        
        {isWin && (
          <View style={styles.winBanner}>
            <Ionicons name="trophy" size={16} color="#F5A524" />
            <Text style={styles.winText}>YOU WON!</Text>
          </View>
        )}
        
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

          <View style={[styles.bidContainer, isWin && styles.bidContainerWin]}>
            <Text style={styles.bidLabel}>
              {isWin ? 'Winning Bid' : item.status === 'ended' ? 'Final Price' : 'Current Bid'}
            </Text>
            <Text style={[styles.currentBid, isWin && styles.currentBidWin]}>
              ${(item.currentCents / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            {item.status !== 'ended' && !isWin && (
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

          {item.status === 'ended' && !isWin && (
            <View style={styles.footer}>
              <Text style={styles.endedText}>Auction Ended</Text>
            </View>
          )}
          
          {isWin && (
            <View style={styles.footer}>
              <TouchableOpacity style={styles.viewReceiptButton}>
                <Ionicons name="receipt-outline" size={16} color="#F5A524" />
                <Text style={styles.viewReceiptText}>View Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (activeTab === 'live') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="time-outline" size={64} color="#2E7D32" />
          </View>
          <Text style={styles.emptyText}>No live auctions right now</Text>
          <Text style={styles.emptySubtext}>
            Check the Upcoming tab to see what's coming next!
          </Text>
          {tabCounts.upcoming > 0 && (
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => handleTabPress('upcoming')}
            >
              <Text style={styles.emptyButtonText}>View Upcoming</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    if (activeTab === 'upcoming') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="calendar-outline" size={64} color="#F5A524" />
          </View>
          <Text style={styles.emptyText}>No upcoming auctions</Text>
          {stats.nextAuction ? (
            <Text style={styles.emptySubtext}>
              Next auction starts soon - check back!
            </Text>
          ) : (
            <Text style={styles.emptySubtext}>
              New auctions will appear here when scheduled
            </Text>
          )}
        </View>
      );
    }
    
    // My Wins
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="trophy-outline" size={64} color="#F5A524" />
        </View>
        <Text style={styles.emptyText}>No wins yet</Text>
        <Text style={styles.emptySubtext}>
          Win your first auction to see it here! 🏆
        </Text>
        {tabCounts.live > 0 && (
          <TouchableOpacity
            style={[styles.emptyButton, styles.emptyButtonGold]}
            onPress={() => handleTabPress('live')}
          >
            <Text style={styles.emptyButtonText}>Start Bidding</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const indicatorTranslateX = tabIndicatorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, SCREEN_WIDTH / 3, (SCREEN_WIDTH / 3) * 2],
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Auctions</Text>
        </View>
        <View style={styles.tabBar}>
          <View style={styles.tab}>
            <Text style={styles.tabTextActiveLive}>🟢 Live</Text>
          </View>
          <View style={styles.tab}>
            <Text style={styles.tabText}>🟡 Upcoming</Text>
          </View>
          <View style={styles.tab}>
            <Text style={styles.tabText}>🏆 My Wins</Text>
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
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress('live')}
          >
            <Text style={[styles.tabText, activeTab === 'live' && styles.tabTextActiveLive]}>
              🟢 Live
            </Text>
            {tabCounts.live > 0 && (
              <PulsingBadge count={tabCounts.live} active={activeTab === 'live'} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActiveUpcoming]}>
              🟡 Upcoming
            </Text>
            {tabCounts.upcoming > 0 && (
              <View style={[styles.badge, activeTab === 'upcoming' && styles.badgeActiveUpcoming]}>
                <Text style={[styles.badgeText, activeTab === 'upcoming' && styles.badgeTextActive]}>
                  {tabCounts.upcoming}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress('mywins')}
          >
            <Text style={[styles.tabText, activeTab === 'mywins' && styles.tabTextActiveWins]}>
              🏆 My Wins
            </Text>
            {tabCounts.mywins > 0 && (
              <View style={[styles.badge, activeTab === 'mywins' && styles.badgeActiveWins]}>
                <Text style={[styles.badgeText, activeTab === 'mywins' && styles.badgeTextActive]}>
                  {tabCounts.mywins}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Animated Indicator */}
        <Animated.View 
          style={[
            styles.tabIndicator,
            activeTab === 'live' && styles.tabIndicatorLive,
            activeTab === 'upcoming' && styles.tabIndicatorUpcoming,
            activeTab === 'mywins' && styles.tabIndicatorWins,
            {
              transform: [{ translateX: indicatorTranslateX }],
            },
          ]} 
        />
      </View>

      {/* Stats Bar */}
      {activeTab === 'live' && tabCounts.live > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{stats.liveCount} Active {stats.liveCount === 1 ? 'Auction' : 'Auctions'}</Text>
          </View>
          {stats.endingSoonCount > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="flash" size={16} color="#D32F2F" />
              <Text style={styles.statHighlight}>
                {stats.endingSoonCount} ending within 1 hour
              </Text>
            </View>
          )}
        </View>
      )}
      
      {/* My Wins Stats */}
      {activeTab === 'mywins' && tabCounts.mywins > 0 && (
        <View style={styles.winsStatsBar}>
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={20} color="#F5A524" />
            <Text style={styles.winsStatText}>
              {stats.winsCount} {stats.winsCount === 1 ? 'Win' : 'Wins'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.winsStatLabel}>Total Value:</Text>
            <Text style={styles.winsStatValue}>
              ${(stats.winsTotal / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      )}

      {/* Sort Menu */}
      {activeTab !== 'mywins' && (
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowSortMenu(!showSortMenu);
            }}
          >
            <Text style={styles.sortButtonText}>
              Sort: {sortBy === 'ending' ? 'Ending Soon' : sortBy === 'highest' ? 'Highest Bid' : 'Newest'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.text.primary} />
          </TouchableOpacity>
          
          {showSortMenu && (
            <View style={styles.sortMenu}>
              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'ending' && styles.sortOptionActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSortBy('ending');
                  setShowSortMenu(false);
                }}
              >
                <Text style={[styles.sortOptionText, sortBy === 'ending' && styles.sortOptionTextActive]}>
                  Ending Soon
                </Text>
                {sortBy === 'ending' && <Ionicons name="checkmark" size={20} color="#2E7D32" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'highest' && styles.sortOptionActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSortBy('highest');
                  setShowSortMenu(false);
                }}
              >
                <Text style={[styles.sortOptionText, sortBy === 'highest' && styles.sortOptionTextActive]}>
                  Highest Bid
                </Text>
                {sortBy === 'highest' && <Ionicons name="checkmark" size={20} color="#2E7D32" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'newest' && styles.sortOptionActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSortBy('newest');
                  setShowSortMenu(false);
                }}
              >
                <Text style={[styles.sortOptionText, sortBy === 'newest' && styles.sortOptionTextActive]}>
                  Newest
                </Text>
                {sortBy === 'newest' && <Ionicons name="checkmark" size={20} color="#2E7D32" />}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Content with Fade Animation */}
      <Animated.View style={[styles.contentContainer, { opacity: contentFadeAnim }]}>
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
          ListEmptyComponent={renderEmptyState()}
        />
      </Animated.View>
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
  tabBarContainer: {
    position: 'relative',
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  tabBar: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  tabText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  tabTextActiveLive: {
    fontWeight: typography.weights.bold,
    color: '#2E7D32',
  },
  tabTextActiveUpcoming: {
    fontWeight: typography.weights.bold,
    color: '#F5A524',
  },
  tabTextActiveWins: {
    fontWeight: typography.weights.bold,
    color: '#F5A524',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    width: SCREEN_WIDTH / 3,
    height: 3,
  },
  tabIndicatorLive: {
    backgroundColor: '#2E7D32',
  },
  tabIndicatorUpcoming: {
    backgroundColor: '#F5A524',
  },
  tabIndicatorWins: {
    backgroundColor: '#F5A524',
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
  badgeActiveLive: {
    backgroundColor: '#2E7D32',
  },
  badgeActiveUpcoming: {
    backgroundColor: '#F5A524',
  },
  badgeActiveWins: {
    backgroundColor: '#F5A524',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },
  badgeTextActive: {
    color: colors.surface,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#E8F5E9',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  winsStatsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF9E6',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F5E5B8',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statLabel: {
    fontSize: typography.body.size,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  statHighlight: {
    fontSize: typography.caption.size,
    fontWeight: typography.weights.semibold,
    color: '#D32F2F',
  },
  winsStatText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.bold,
    color: '#F5A524',
  },
  winsStatLabel: {
    fontSize: typography.caption.size,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  winsStatValue: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  sortContainer: {
    position: 'relative',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  sortButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  sortMenu: {
    position: 'absolute',
    top: '100%',
    right: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    minWidth: 180,
    zIndex: 1000,
    ...shadow.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortOptionActive: {
    backgroundColor: '#F0F7FF',
  },
  sortOptionText: {
    fontSize: typography.body.size,
    color: colors.text.primary,
  },
  sortOptionTextActive: {
    fontWeight: typography.weights.semibold,
    color: '#2E7D32',
  },
  contentContainer: {
    flex: 1,
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
  cardEndingSoon: {
    borderWidth: 2,
    borderColor: '#D32F2F',
  },
  cardWin: {
    borderWidth: 2,
    borderColor: '#F5A524',
  },
  endingSoonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  endingSoonText: {
    fontSize: typography.caption.size,
    fontWeight: typography.weights.bold,
    color: colors.surface,
    letterSpacing: 0.5,
  },
  winBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A524',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  winText: {
    fontSize: typography.caption.size,
    fontWeight: typography.weights.bold,
    color: colors.surface,
    letterSpacing: 0.5,
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
    backgroundColor: '#2E7D32',
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
  bidContainerWin: {
    backgroundColor: '#FFF9E6',
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
  currentBidWin: {
    color: '#F5A524',
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
    backgroundColor: '#2E7D32',
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
  viewReceiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#FFF9E6',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#F5A524',
  },
  viewReceiptText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: '#F5A524',
  },
  emptyContainer: {
    paddingVertical: spacing.xxl * 2,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  emptyIconContainer: {
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.title.size,
    fontWeight: typography.title.weight,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.body.size,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  emptyButtonGold: {
    backgroundColor: '#F5A524',
  },
  emptyButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.surface,
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
