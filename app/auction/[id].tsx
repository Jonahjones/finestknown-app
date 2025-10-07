import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useRealtime } from '../../src/providers/RealtimeProvider';
import { Auction, Bid, getAuction, listBids, placeBid } from '../../src/services/auction';
import { colors } from '../../src/theme';

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { subscribe, unsubscribe } = useRealtime();

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [auctionData, bidsData] = await Promise.all([getAuction(id), listBids(id)]);
      setAuction(auctionData);
      setBids(bidsData);
      
      // Auto-fill bid amount with minimum next bid
      const minBid = auctionData.currentCents + (auctionData.minIncrementCents || 100);
      setBidAmount((minBid / 100).toFixed(2));
    } catch (error) {
      console.error('Failed to fetch auction:', error);
      Alert.alert('Error', 'Failed to load auction details');
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
      Alert.alert('Invalid Amount', 'Please enter a valid bid amount');
      return;
    }

    const amountCents = Math.round(amount * 100);
    const minBid = auction.currentCents + (auction.minIncrementCents || 100);

    if (amountCents < minBid) {
      Alert.alert('Bid Too Low', `Minimum bid: $${(minBid / 100).toFixed(2)}`);
      return;
    }

    try {
      setSubmitting(true);
      await placeBid(id, amountCents);
      await fetchData();
      Alert.alert('Success', 'Your bid has been placed!');
      // Bid amount will be auto-updated by fetchData
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !auction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  const isDisabled = auction.status === 'ended' || expired;
  const minBid = ((auction.currentCents + (auction.minIncrementCents || 100)) / 100).toFixed(2);

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auction Details</Text>
          <View style={{ width: 40 }} />
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

        {/* Main Info */}
        <View style={styles.mainSection}>
          <Text style={styles.title}>{auction.title}</Text>

          {/* Current Bid */}
          <View style={styles.bidSection}>
            <Text style={styles.bidLabel}>Current Bid</Text>
            <Text style={styles.currentBid}>
              ${(auction.currentCents / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          {/* Time Remaining */}
          <View style={styles.timeSection}>
            <Ionicons name="time-outline" size={20} color="#D32F2F" />
            <Text style={styles.timeLabel}>Time Remaining:</Text>
            <CountdownTimer endAt={auction.endAt} onExpire={() => setExpired(true)} />
          </View>
        </View>

        {/* Bid History */}
        {bids.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Bid History</Text>
            <FlatList
              data={bids.slice(0, 10)}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <View style={[styles.bidItem, index === 0 && styles.highBidItem]}>
                  <View style={styles.bidLeft}>
                    <Text style={[styles.bidderName, index === 0 && styles.highBidder]}>
                      {item.userDisplay}
                      {index === 0 && ' (High Bidder)'}
                    </Text>
                    <Text style={styles.bidTime}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={[styles.bidAmount, index === 0 && styles.highBidAmount]}>
                    ${(item.amountCents / 100).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>

      {/* Bid Input - Sticky */}
      {!isDisabled && (
        <View style={styles.bidInputSection}>
          <View style={styles.bidInputContainer}>
            <Text style={styles.bidInputLabel}>Your Maximum Bid</Text>
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
  mainSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.title.size,
    lineHeight: typography.title.lineHeight,
    fontWeight: typography.title.weight,
    color: colors.text.primary,
    marginBottom: spacing.lg,
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
  bidLeft: {
    flex: 1,
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
  bidInputSection: {
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
});
