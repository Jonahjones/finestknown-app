import { getUserOrders } from '@/src/api/checkout';
import { Card } from '@/src/components/ui';
import { colors, radius, shadows, spacing, typography } from '@/src/design/tokens';
import { analytics } from '@/src/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function OrdersScreen() {
  React.useEffect(() => {
    analytics.screen('orders');
  }, []);

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['userOrders'],
    queryFn: getUserOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleBack = () => {
    router.back();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return colors.success;
      case 'processing':
        return colors.info;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'checkmark-circle';
      case 'processing':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.red} />
          <Text style={styles.errorTitle}>Failed to Load Orders</Text>
          <Text style={styles.errorMessage}>
            We couldn\'t load your order history. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={[colors.primary, colors.primary + 'E6']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.surface} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Order History</Text>
            <Text style={styles.headerSubtitle}>
              {orders ? `${orders.length} orders` : 'Loading...'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => {/* Filter functionality */}}
          >
            <Ionicons name="filter-outline" size={24} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order.id} elevation="e2" style={styles.orderCard}>
              {/* Order Header with Status */}
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>Order #{order.id.slice(-8)}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <View style={styles.orderStatus}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) }
                  ]}>
                    <Ionicons 
                      name={getStatusIcon(order.status)} 
                      size={14} 
                      color={colors.surface} 
                    />
                    <Text style={styles.statusText}>{order.status}</Text>
                  </View>
                </View>
              </View>

              {/* Order Items Preview */}
              <View style={styles.orderItems}>
                {order.order_items?.slice(0, 2).map((item: any, index: number) => (
                  <View key={index} style={styles.orderItem}>
                    <View style={styles.itemImageContainer}>
                      <View style={styles.itemImagePlaceholder}>
                        <Ionicons name="diamond-outline" size={20} color={colors.textPrimaryTertiary} />
                      </View>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemDetails}>
                        Qty: {item.qty} × {formatPrice(item.price_cents)}
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>
                      {formatPrice(item.price_cents * item.qty)}
                    </Text>
                  </View>
                ))}
                {order.order_items && order.order_items.length > 2 && (
                  <View style={styles.moreItems}>
                    <Text style={styles.moreItemsText}>
                      +{order.order_items.length - 2} more items
                    </Text>
                  </View>
                )}
              </View>

              {/* Order Total */}
              <View style={styles.orderTotal}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>
                  {formatPrice(order.total_cents)}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.orderActions}>
                <TouchableOpacity 
                  style={styles.primaryAction}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/account/orders/${order.id}`)}
                >
                  <Ionicons name="eye-outline" size={18} color={colors.surface} />
                  <Text style={styles.primaryActionText}>View Details</Text>
                </TouchableOpacity>
                
                {order.status.toLowerCase() === 'processing' && (
                  <TouchableOpacity 
                    style={styles.secondaryAction}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="location-outline" size={18} color={colors.primary} />
                    <Text style={styles.secondaryActionText}>Track</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="receipt-outline" size={64} color={colors.textPrimaryTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyMessage}>
              Your order history will appear here once you make your first purchase.
            </Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => router.push('/(tabs)/catalog')}
              activeOpacity={0.7}
            >
              <Ionicons name="diamond-outline" size={20} color={colors.surface} />
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  headerGradient: {
    paddingTop: spacing.s,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: colors.primary + '20',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.title.fontSize,
    lineHeight: typography.title.lineHeight,
    fontWeight: typography.title.fontWeight,
    color: colors.surface,
  },
  headerSubtitle: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.caption.weight,
    color: colors.surface + 'CC',
    marginTop: spacing.xs,
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: colors.primary + '20',
  },
  scrollView: {
    flex: 1,
  },
  orderCard: {
    margin: spacing.l,
    padding: spacing.xl,
    borderRadius: radius.lg,
    ...shadows.e2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.l,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: typography.heading.fontSize,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.fontWeight,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  orderDate: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.caption.weight,
    color: colors.textSecondary,
  },
  orderStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.surface,
    marginLeft: spacing.xs,
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceAlt,
    paddingTop: spacing.l,
    marginBottom: spacing.l,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  itemImageContainer: {
    marginRight: spacing.m,
  },
  itemImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.m,
  },
  itemName: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  itemDetails: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.caption.weight,
    color: colors.textSecondary,
  },
  itemTotal: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  moreItems: {
    paddingVertical: spacing.s,
    alignItems: 'center',
  },
  moreItemsText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.caption.weight,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceAlt,
    paddingTop: spacing.l,
    marginBottom: spacing.l,
  },
  totalLabel: {
    fontSize: typography.heading.fontSize,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.fontWeight,
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: typography.heading.fontSize,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.fontWeight,
    color: colors.primary,
  },
  orderActions: {
    flexDirection: 'row',
    gap: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceAlt,
    paddingTop: spacing.l,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radius.md,
    minHeight: 44,
  },
  primaryActionText: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.surface,
    marginLeft: spacing.s,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radius.md,
    minHeight: 44,
  },
  secondaryActionText: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.medium,
    color: colors.primary,
    marginLeft: spacing.s,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl * 2,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  emptyTitle: {
    fontSize: typography.title.fontSize,
    lineHeight: typography.title.lineHeight,
    fontWeight: typography.title.fontWeight,
    color: colors.primary,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.l,
    borderRadius: radius.lg,
    minHeight: 48,
    ...shadows.e2,
  },
  shopButtonText: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.surface,
    marginLeft: spacing.s,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  errorMessage: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});
