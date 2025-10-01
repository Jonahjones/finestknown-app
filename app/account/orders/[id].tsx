import { getUserOrders } from '@/src/api/checkout';
// AppHeader component removed - using basic header instead
import { AuthWrapper } from '@/src/components/AuthWrapper';
import { Card } from '@/src/components/ui';
import { colors, radius, shadows, spacing, typography } from '@/src/design/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['userOrders'],
    queryFn: getUserOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const order = orders?.find(o => o.id === id);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return colors.green;
      case 'shipped':
        return colors.blue;
      case 'delivered':
        return colors.green;
      case 'canceled':
        return colors.red;
      default:
        return colors.slate;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'checkmark-circle';
      case 'shipped':
        return 'car';
      case 'delivered':
        return 'checkmark-done-circle';
      case 'canceled':
        return 'close-circle';
      default:
        return 'time';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'Your payment has been processed successfully.';
      case 'shipped':
        return 'Your order is on its way to you.';
      case 'delivered':
        return 'Your order has been delivered.';
      case 'canceled':
        return 'This order has been canceled.';
      default:
        return 'Your order is being processed.';
    }
  };

  if (isLoading) {
    return (
      <AuthWrapper>
        <SafeAreaView style={styles.container}>
          <View style={styles.header} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading order details...</Text>
          </View>
        </SafeAreaView>
      </AuthWrapper>
    );
  }

  if (error || !order) {
    return (
      <AuthWrapper>
        <SafeAreaView style={styles.container}>
          <View style={styles.header} />
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.red} />
            <Text style={styles.errorTitle}>Order Not Found</Text>
            <Text style={styles.errorMessage}>
              We couldn\'t find the order you\'re looking for.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <SafeAreaView style={styles.container}>
        {/* Modern Header with Gradient */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'E6']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.surface} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Order #{order.id.slice(-8)}</Text>
              <Text style={styles.headerSubtitle}>
                {formatDate(order.created_at)}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={() => {/* Share functionality */}}
            >
              <Ionicons name="share-outline" size={24} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Order Status Hero */}
          <View style={styles.statusHero}>
            <LinearGradient
              colors={[getStatusColor(order.status) + '20', getStatusColor(order.status) + '10']}
              style={styles.statusGradient}
            >
              <View style={styles.statusIconContainer}>
                <Ionicons 
                  name={getStatusIcon(order.status)} 
                  size={32} 
                  color={getStatusColor(order.status)} 
                />
              </View>
              <Text style={styles.statusTitle}>{order.status}</Text>
              <Text style={styles.statusDescription}>
                {getStatusDescription(order.status)}
              </Text>
            </LinearGradient>
          </View>

          {/* Order Items */}
          <Card elevation="e2" style={styles.itemsCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cube-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Order Items</Text>
            </View>
            {order.order_items?.map((item: any, index: number) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemImageContainer}>
                  <View style={styles.itemImagePlaceholder}>
                    <Ionicons name="diamond-outline" size={24} color={colors.textPrimaryTertiary} />
                  </View>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemQuantity}>
                      Qty: {item.qty}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {formatPrice(item.price_cents * item.qty)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </Card>

          {/* Order Summary */}
          <Card elevation="e2" style={styles.summaryCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calculator-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Order Summary</Text>
            </View>
            
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  {formatPrice(order.subtotal_cents)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>
                  {order.shipping_cents === 0 ? 'FREE' : formatPrice(order.shipping_cents)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>
                  {formatPrice(order.tax_cents)}
                </Text>
              </View>
              
              <View style={styles.separator} />
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {formatPrice(order.total_cents)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Order Information */}
          <Card elevation="e2" style={styles.infoCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Order Information</Text>
            </View>
            
            <View style={styles.infoContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Order ID</Text>
                <TouchableOpacity
                  style={styles.idContainer}
                  onPress={() => {
                    Alert.alert('Copied', 'Order ID copied to clipboard');
                  }}
                >
                  <Text style={styles.idValue}>{order.id}</Text>
                  <Ionicons name="copy-outline" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Order Date</Text>
                <Text style={styles.infoValue}>
                  {formatDate(order.created_at)}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) }
                ]}>
                  <Text style={styles.statusBadgeText}>{order.status}</Text>
                </View>
              </View>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </AuthWrapper>
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
  shareButton: {
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
  statusHero: {
    margin: spacing.l,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.e3,
  },
  statusGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  statusTitle: {
    fontSize: typography.heading.fontSize,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.fontWeight,
    color: colors.primary,
    marginBottom: spacing.s,
  },
  statusDescription: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  itemsCard: {
    margin: spacing.l,
    padding: spacing.xl,
    borderRadius: radius.lg,
    ...shadows.e2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: typography.heading.fontSize,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.fontWeight,
    color: colors.primary,
    marginLeft: spacing.s,
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  itemImageContainer: {
    marginRight: spacing.m,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.medium,
    color: colors.primary,
    marginBottom: spacing.s,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.caption.weight,
    color: colors.textSecondary,
  },
  itemPrice: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  summaryCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
    padding: spacing.xl,
    borderRadius: radius.lg,
    ...shadows.e2,
  },
  summaryContent: {
    gap: spacing.s,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  summaryLabel: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.surfaceAlt,
    marginVertical: spacing.s,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  totalLabel: {
    fontSize: typography.heading.fontSize,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.fontWeight,
    color: colors.primary,
  },
  totalValue: {
    fontSize: typography.heading.fontSize,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.fontWeight,
    color: colors.primary,
  },
  infoCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.lg,
    ...shadows.e2,
  },
  infoContent: {
    gap: spacing.m,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  infoLabel: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
  },
  idValue: {
    fontSize: typography.caption.fontSize,
    fontFamily: 'monospace',
    color: colors.primary,
    marginRight: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  statusBadgeText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.surface,
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.weights.semibold,
    color: colors.surface,
  },
});

