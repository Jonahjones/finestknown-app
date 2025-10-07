import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuctionBadge, AuctionStatus } from '../../src/components/auction/AuctionBadge';
import { DatePicker } from '../../src/components/DatePicker';
import { Button } from '../../src/components/ui/Button';
import { radius, spacing, typography } from '../../src/design/tokens';
import { useIsAdmin } from '../../src/hooks/useIsAdmin';
import { supabase } from '../../src/lib/supabase';
import { colors } from '../../src/theme';

interface AuctionProduct {
  id: string;
  title: string;
  price_cents: number;
  is_auction: boolean;
  auction_end_at: string | null;
  photos: string[];
}

export default function AdminAuctionsScreen() {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [products, setProducts] = useState<AuctionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AuctionProduct | null>(null);
  const [endDate, setEndDate] = useState('');

  React.useEffect(() => {
    fetchAuctionProducts();
  }, []);

  const fetchAuctionProducts = async () => {
    try {
      setLoading(true);
      console.log('📦 Fetching auction products...');
      
      const { data, error } = await supabase
        .from('products')
        .select('id, title, price_cents, is_auction, auction_end_at, photos')
        .eq('is_auction', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching products:', error);
        throw error;
      }

      console.log('✅ Found auction products:', data?.length || 0);
      setProducts(data || []);
    } catch (error: any) {
      console.error('Failed to fetch auction products:', error);
      Alert.alert('Error', error?.message || 'Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  const handleSetEndDate = async () => {
    if (!selectedProduct || !endDate) {
      Alert.alert('Error', 'Please select an end date');
      return;
    }

    try {
      console.log('📅 Setting end date for product:', selectedProduct.id, endDate);

      // Parse the date string and convert to ISO string
      const [year, month, day] = endDate.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day, 23, 59, 59);

      const { error } = await supabase
        .from('products')
        .update({
          auction_end_at: dateObj.toISOString(),
        })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      console.log('✅ End date set successfully');
      setShowEditModal(false);
      setSelectedProduct(null);
      setEndDate('');
      await fetchAuctionProducts();
      Alert.alert('Success', 'Auction end date updated');
    } catch (error: any) {
      console.error('❌ Failed to set end date:', error);
      Alert.alert('Error', error?.message || 'Failed to update auction');
    }
  };

  const handleRemoveFromAuction = async (productId: string) => {
    Alert.alert(
      'Remove from Auction',
      'Are you sure you want to remove this item from auction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .update({
                  is_auction: false,
                  auction_end_at: null,
                })
                .eq('id', productId);

              if (error) throw error;

              await fetchAuctionProducts();
              Alert.alert('Success', 'Removed from auction');
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to remove from auction');
            }
          },
        },
      ]
    );
  };

  const getAuctionStatus = (product: AuctionProduct): AuctionStatus => {
    if (!product.auction_end_at) return 'scheduled';
    const now = new Date();
    const endAt = new Date(product.auction_end_at);
    return endAt <= now ? 'ended' : 'live';
  };

  if (isAdminLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Access Denied</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Auctions</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Ionicons name="information-circle" size={24} color={colors.brand} />
        <View style={styles.instructionsText}>
          <Text style={styles.instructionsTitle}>How to add items to auction:</Text>
          <Text style={styles.instructionsBody}>
            1. Go to Products admin panel{'\n'}
            2. Toggle "Is Auction" on for any product{'\n'}
            3. Come here to set the auction end date
          </Text>
        </View>
      </View>

      {/* Auctions List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.auctionRow}>
              <View style={styles.auctionInfo}>
                <Text style={styles.auctionTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.auctionMeta}>
                  <AuctionBadge status={getAuctionStatus(item)} compact />
                  <Text style={styles.metaText}>
                    ${(item.price_cents / 100).toFixed(2)}
                  </Text>
                  {item.auction_end_at && (
                    <Text style={styles.metaText}>
                      {new Date(item.auction_end_at).toLocaleDateString()}
                    </Text>
                  )}
                  {!item.auction_end_at && (
                    <Text style={styles.warningText}>No end date set</Text>
                  )}
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedProduct(item);
                    setEndDate(
                      item.auction_end_at
                        ? new Date(item.auction_end_at).toISOString().split('T')[0]
                        : ''
                    );
                    setShowEditModal(true);
                  }}
                  accessibilityLabel="Set end date"
                >
                  <Ionicons name="calendar" size={24} color={colors.brand} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/auction/${item.id}` as any)}
                  accessibilityLabel="View auction"
                >
                  <Ionicons name="eye-outline" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleRemoveFromAuction(item.id)}
                  accessibilityLabel="Remove from auction"
                >
                  <Ionicons name="trash-outline" size={24} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="hammer-outline" size={64} color={colors.text.muted} />
              <Text style={styles.emptyText}>No auction items yet</Text>
              <Text style={styles.emptySubtext}>
                Go to Products admin and toggle "Is Auction" on any product
              </Text>
            </View>
          }
        />
      )}

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Auction End Date</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                accessibilityLabel="Close modal"
              >
                <Ionicons name="close" size={28} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedProduct && (
                <View style={styles.productPreview}>
                  <Text style={styles.productTitle}>{selectedProduct.title}</Text>
                  <Text style={styles.productPrice}>
                    Starting bid: ${(selectedProduct.price_cents / 100).toFixed(2)}
                  </Text>
                </View>
              )}

              <Text style={styles.label}>End Date & Time</Text>
              <DatePicker
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                minimumDate={new Date()}
              />

              <Button
                title="Save End Date"
                onPress={handleSetEndDate}
                variant="primary"
                size="large"
                style={styles.submitButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.title.size,
    lineHeight: typography.title.lineHeight,
    fontWeight: typography.title.weight,
    color: colors.text.primary,
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brand,
    gap: spacing.md,
  },
  instructionsText: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  instructionsBody: {
    fontSize: typography.caption.size,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  listContent: {
    padding: spacing.lg,
  },
  auctionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  auctionInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  auctionTitle: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  auctionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: typography.caption.size,
    color: colors.text.secondary,
  },
  warningText: {
    fontSize: typography.caption.size,
    color: colors.danger,
    fontWeight: typography.weights.semibold,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: spacing.md,
  },
  emptyContainer: {
    paddingVertical: spacing.xxl * 3,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.title.size,
    fontWeight: typography.title.weight,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.body.size,
    color: colors.text.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    fontSize: typography.heading.size,
    color: colors.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.title.size,
    lineHeight: typography.title.lineHeight,
    fontWeight: typography.title.weight,
    color: colors.text.primary,
  },
  modalBody: {
    padding: spacing.lg,
  },
  productPreview: {
    backgroundColor: colors.bg,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  productTitle: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  productPrice: {
    fontSize: typography.caption.size,
    color: colors.text.secondary,
  },
  label: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  submitButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
});
