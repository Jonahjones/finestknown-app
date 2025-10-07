import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuctionBadge } from '../../src/components/auction/AuctionBadge';
import { CountdownTimer } from '../../src/components/auction/CountdownTimer';
import { radius, spacing, typography } from '../../src/design/tokens';
import { supabase } from '../../src/lib/supabase';
import { useRealtime } from '../../src/providers/RealtimeProvider';
import { Auction, Bid, getAuction, listAuctions, listBids, placeBid } from '../../src/services/auction';
import { colors } from '../../src/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Haptics fallback
const Haptics = {
  impactAsync: async (_style?: any) => {},
  notificationAsync: async (_type?: any) => {},
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
};

// Toast Notification Component
function Toast({ message, type = 'success', onHide }: { message: string; type?: 'success' | 'error'; onHide: () => void }) {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.delay(2000),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  }, []);

  return (
    <Animated.View
      style={[
        styles.toast,
        type === 'success' ? styles.toastSuccess : styles.toastError,
        { transform: [{ translateY }] },
      ]}
    >
      <Ionicons
        name={type === 'success' ? 'checkmark-circle' : 'alert-circle'}
        size={24}
        color={colors.surface}
      />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

// Skeleton Loader
function DetailSkeleton() {
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
    <View>
      <Animated.View style={[styles.skeletonImage, { opacity }]} />
      <View style={styles.mainSection}>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonBid, { opacity }]} />
        <Animated.View style={[styles.skeletonTime, { opacity }]} />
      </View>
    </View>
  );
}

// Relative time formatter
function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [similarAuctions, setSimilarAuctions] = useState<Auction[]>([]);
  const { subscribe, unsubscribe } = useRealtime();

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    });
  }, []);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [auctionData, bidsData, allAuctions] = await Promise.all([
        getAuction(id),
        listBids(id),
        listAuctions(),
      ]);
      setAuction(auctionData);
      setBids(bidsData);
      
      // Get similar auctions (excluding current)
      const similar = allAuctions.filter(a => a.id !== id && a.status === 'live').slice(0, 3);
      setSimilarAuctions(similar);
      
      // Auto-fill bid amount with minimum next bid
      const minBid = auctionData.currentCents + (auctionData.minIncrementCents || 100);
      setBidAmount((minBid / 100).toFixed(2));
    } catch (error) {
      console.error('Failed to fetch auction:', error);
      setToast({ message: 'Failed to load auction details', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!id) return;
    const channelName = `auctions:${id}`;
    const handler = (payload: { currentCents: number }) => {
      setAuction((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, currentCents: payload.currentCents };
        
        // Update bid amount to new minimum when current bid changes
        const minBid = updated.currentCents + (updated.minIncrementCents || 100);
        setBidAmount((minBid / 100).toFixed(2));
        
        return updated;
      });
      listBids(id).then(setBids).catch(console.error);
    };
    subscribe(channelName, handler);
    return () => unsubscribe(channelName, handler);
  }, [id, subscribe, unsubscribe]);

  const handlePlaceBid = async () => {
    if (!id || !auction) return;
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setToast({ message: 'Please enter a valid bid amount', type: 'error' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const amountCents = Math.round(amount * 100);
    const minBid = auction.currentCents + (auction.minIncrementCents || 100);

    if (amountCents < minBid) {
      setToast({ message: `Minimum bid: $${(minBid / 100).toFixed(2)}`, type: 'error' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      setSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await placeBid(id, amountCents);
      await fetchData();
      setToast({ message: '🎉 Your bid has been placed!', type: 'success' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      setToast({ message: error?.message || 'Failed to place bid', type: 'error' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickBid = (increment: number) => {
    if (!auction) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = parseFloat(bidAmount) || (auction.currentCents / 100);
    const newAmount = current + increment;
    setBidAmount(newAmount.toFixed(2));
  };

  const isHighBidder = currentUserId && bids.length > 0 && bids[0].userId === currentUserId;

  if (loading || !auction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auction Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView>
          <DetailSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const isDisabled = auction.status === 'ended' || expired;
  const minBid = ((auction.currentCents + (auction.minIncrementCents || 100)) / 100).toFixed(2);
  const watcherCount = Math.floor(Math.random() * 15) + 5; // Mock watchers

  return (
    <View style={styles.container}>
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(null)}
        />
      )}

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auction Details</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: auction.imageUrl || 'https://via.placeholder.com/800x600/F7F6F3/999?text=No+Image',
            }}
            style={styles.image}
            resizeMode="contain"
          />
          <View style={styles.badgeOverlay}>
            <AuctionBadge status={auction.status} />
          </View>
        </View>

        {/* High Bidder Banner */}
        {isHighBidder && !isDisabled && (
          <View style={styles.highBidderBanner}>
            <Ionicons name="trophy" size={20} color="#2E7D32" />
            <Text style={styles.highBidderText}>You're the high bidder! 🏆</Text>
          </View>
        )}

        {/* Main Info */}
        <View style={styles.mainSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{auction.title}</Text>
            <View style={styles.watcherBadge}>
              <Ionicons name="eye-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.watcherText}>{watcherCount}</Text>
            </View>
          </View>

          {/* Current Bid */}
          <View style={styles.bidSection}>
            <Text style={styles.bidLabel}>Current Bid</Text>
            <Text style={styles.currentBid}>
              ${(auction.currentCents / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text style={styles.bidCount}>{bids.length} {bids.length === 1 ? 'bid' : 'bids'}</Text>
          </View>

          {/* Time Remaining */}
          <View style={styles.timeSection}>
            <Ionicons name="time-outline" size={20} color="#D32F2F" />
            <Text style={styles.timeLabel}>Time Remaining:</Text>
            <CountdownTimer endAt={auction.endAt} onExpire={() => setExpired(true)} />
          </View>
        </View>

        {/* Product Details (Expandable) */}
        <TouchableOpacity
          style={styles.detailsToggle}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setDetailsExpanded(!detailsExpanded);
          }}
        >
          <Text style={styles.detailsToggleText}>Product Details</Text>
          <Ionicons
            name={detailsExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        
        {detailsExpanded && (
          <View style={styles.detailsContent}>
            <Text style={styles.detailsText}>
              High-quality precious metal item. Authenticated and certified.
            </Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Condition:</Text>
              <Text style={styles.detailValue}>Excellent</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>Precious Metals</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Seller:</Text>
              <Text style={styles.detailValue}>Finest Known</Text>
            </View>
          </View>
        )}

        {/* Bid History */}
        {bids.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Bid History ({bids.length})</Text>
            <FlatList
              data={bids.slice(0, 10)}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => {
                const isUserBid = item.userId === currentUserId;
                const prevBid = index < bids.length - 1 ? bids[index + 1] : null;
                const increment = prevBid ? item.amountCents - prevBid.amountCents : null;

                return (
                  <View style={[
                    styles.bidItem,
                    index === 0 && styles.highBidItem,
                    isUserBid && styles.userBidItem,
                  ]}>
                    <View style={styles.bidLeft}>
                      <Text style={[
                        styles.bidderName,
                        index === 0 && styles.highBidder,
                        isUserBid && styles.userBidderName,
                      ]}>
                        {isUserBid ? 'You' : item.userDisplay}
                        {index === 0 && ' (High Bidder)'}
                      </Text>
                      <Text style={styles.bidTime}>
                        {formatRelativeTime(item.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.bidRight}>
                      <Text style={[
                        styles.bidAmount,
                        index === 0 && styles.highBidAmount,
                        isUserBid && styles.userBidAmount,
                      ]}>
                        ${(item.amountCents / 100).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                      {increment && increment > 0 && (
                        <Text style={styles.bidIncrement}>
                          +${(increment / 100).toFixed(2)}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              }}
            />
          </View>
        )}

        {/* Similar Auctions */}
        {similarAuctions.length > 0 && (
          <View style={styles.similarSection}>
            <Text style={styles.sectionTitle}>Similar Auctions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {similarAuctions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.similarCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/auction/${item.id}` as any);
                  }}
                >
                  <Image
                    source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
                    style={styles.similarImage}
                  />
                  <Text style={styles.similarTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.similarPrice}>
                    ${(item.currentCents / 100).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Bid Input - Sticky */}
      {!isDisabled && (
        <View style={styles.bidInputSection}>
          <View style={styles.bidInputContainer}>
            <Text style={styles.bidInputLabel}>Your Maximum Bid</Text>
            
            {/* Quick Bid Buttons */}
            <View style={styles.quickBidRow}>
              <TouchableOpacity
                style={styles.quickBidButton}
                onPress={() => handleQuickBid(5)}
              >
                <Text style={styles.quickBidText}>+$5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickBidButton}
                onPress={() => handleQuickBid(10)}
              >
                <Text style={styles.quickBidText}>+$10</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickBidButton}
                onPress={() => handleQuickBid(25)}
              >
                <Text style={styles.quickBidText}>+$25</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputWrapper}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.bidInput}
                  value={bidAmount}
                  onChangeText={setBidAmount}
                  placeholder={minBid}
                  placeholderTextColor={colors.text.muted}
                  keyboardType="decimal-pad"
                  editable={!submitting}
                />
              </View>
              <TouchableOpacity
                style={[styles.submitButton, (submitting || !bidAmount) && styles.submitButtonDisabled]}
                onPress={handlePlaceBid}
                disabled={submitting || !bidAmount}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.submitButtonText}>Place Bid</Text>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.minBidText}>
              Enter ${minBid} or more
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safeArea: {
    backgroundColor: colors.surface,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.heading.size,
    fontWeight: typography.heading.weight,
    color: colors.text.primary,
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  highBidderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  highBidderText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.bold,
    color: '#2E7D32',
  },
  mainSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    flex: 1,
    fontSize: typography.title.size,
    lineHeight: typography.title.lineHeight,
    fontWeight: typography.title.weight,
    color: colors.text.primary,
    marginRight: spacing.md,
  },
  watcherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    gap: 4,
  },
  watcherText: {
    fontSize: typography.caption.size,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  bidSection: {
    marginBottom: spacing.lg,
  },
  bidLabel: {
    fontSize: typography.caption.size,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  currentBid: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: '#D32F2F',
  },
  bidCount: {
    fontSize: typography.caption.size,
    color: colors.text.secondary,
    marginTop: 4,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: spacing.md,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  timeLabel: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  detailsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailsToggleText: {
    fontSize: typography.heading.size,
    fontWeight: typography.heading.weight,
    color: colors.text.primary,
  },
  detailsContent: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailsText: {
    fontSize: typography.body.size,
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.body.size,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  historySection: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.heading.size,
    fontWeight: typography.heading.weight,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  bidItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  highBidItem: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing.md,
    marginHorizontal: -spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: 0,
  },
  userBidItem: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: spacing.md,
    marginHorizontal: -spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: 0,
  },
  bidLeft: {
    flex: 1,
  },
  bidRight: {
    alignItems: 'flex-end',
  },
  bidderName: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  highBidder: {
    fontWeight: typography.weights.bold,
    color: '#2E7D32',
  },
  userBidderName: {
    fontWeight: typography.weights.bold,
    color: '#1976D2',
  },
  bidTime: {
    fontSize: typography.caption.size,
    color: colors.text.muted,
  },
  bidAmount: {
    fontSize: typography.heading.size,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  highBidAmount: {
    color: '#2E7D32',
  },
  userBidAmount: {
    color: '#1976D2',
  },
  bidIncrement: {
    fontSize: typography.caption.size,
    color: '#2E7D32',
    marginTop: 2,
    fontWeight: typography.weights.medium,
  },
  similarSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  similarCard: {
    width: 150,
    marginRight: spacing.md,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  similarImage: {
    width: 150,
    height: 150,
    backgroundColor: '#F7F6F3',
  },
  similarTitle: {
    fontSize: typography.caption.size,
    color: colors.text.primary,
    padding: spacing.sm,
    fontWeight: typography.weights.medium,
    minHeight: 40,
  },
  similarPrice: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.bold,
    color: '#D32F2F',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  bidInputSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  bidInputContainer: {
    padding: spacing.lg,
  },
  bidInputLabel: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  quickBidRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickBidButton: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: '#0654BA',
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  quickBidText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: '#0654BA',
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  dollarSign: {
    fontSize: typography.title.size,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  bidInput: {
    flex: 1,
    fontSize: typography.title.size,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    padding: 0,
  },
  submitButton: {
    backgroundColor: '#0654BA',
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
  minBidText: {
    fontSize: typography.caption.size,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  toast: {
    position: 'absolute',
    top: 0,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  toastSuccess: {
    backgroundColor: '#2E7D32',
  },
  toastError: {
    backgroundColor: '#D32F2F',
  },
  toastText: {
    flex: 1,
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.surface,
  },
  // Skeleton styles
  skeletonImage: {
    width: '100%',
    height: 400,
    backgroundColor: colors.border,
  },
  skeletonTitle: {
    height: 24,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.md,
    width: '70%',
  },
  skeletonBid: {
    height: 40,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.md,
    width: '40%',
  },
  skeletonTime: {
    height: 50,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '100%',
  },
});
