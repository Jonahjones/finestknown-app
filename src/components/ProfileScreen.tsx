import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getUserOrders } from '../api/checkout';
import { colors, radius, spacing, typography } from '../design/tokens';
import { useAuth } from '../store/AuthContext';
import { Badge, Button, Card } from './ui';

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [showAllOrders, setShowAllOrders] = useState(false);

  // Fetch user orders
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: getUserOrders,
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleCopyUserId = () => {
    if (user?.id) {
      Clipboard.setString(user.id);
      Alert.alert('Copied', 'User ID copied to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'success';
      case 'processing':
      case 'pending':
        return 'info';
      case 'failed':
      case 'cancelled':
        return 'danger';
      default:
        return 'outline';
    }
  };

  const renderOrderItem = ({ item: order }: { item: any }) => {
    const itemCount = order.order_items?.length || 0;
    const totalItems = order.order_items?.reduce((sum: number, item: any) => sum + item.qty, 0) || 0;
    const shortOrderId = `#${order.id.slice(-8)}`;

    return (
      <Card elevation="e1" style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <TouchableOpacity 
            onPress={() => Clipboard.setString(order.id)}
            style={styles.orderIdContainer}
          >
            <Text style={styles.orderId}>{shortOrderId}</Text>
            <Text style={styles.copyIcon}>📋</Text>
          </TouchableOpacity>
          <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
        </View>
        
        <View style={styles.orderSummary}>
          <View style={styles.orderStatusContainer}>
            <Badge 
              label={order.status || 'Unknown'} 
              variant={getStatusBadgeVariant(order.status)}
            />
          </View>
          <Text style={styles.orderTotal}>{formatPrice(order.total_cents)}</Text>
        </View>
        
        <Text style={styles.orderItemCount}>
          {totalItems} item{totalItems !== 1 ? 's' : ''} ({itemCount} product{itemCount !== 1 ? 's' : ''})
        </Text>
        
        {order.order_items && order.order_items.length > 0 && (
          <View style={styles.orderItemsList}>
            {order.order_items.slice(0, 2).map((item: any, index: number) => (
              <View key={index} style={styles.orderItemRow}>
                <View style={styles.orderItemThumbnail} />
                <Text style={styles.orderItemText} numberOfLines={1}>
                  {item.title} × {item.qty}
                </Text>
              </View>
            ))}
            {order.order_items.length > 2 && (
              <Text style={styles.moreItemsText}>
                +{order.order_items.length - 2} more item{order.order_items.length - 2 !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        )}
      </Card>
    );
  };

  const displayedOrders = showAllOrders ? orders : orders.slice(0, 3);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>
      
      <View style={styles.content}>
        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <Card elevation="e1" style={styles.profileCard}>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Email</Text>
              <Text style={styles.profileValue} numberOfLines={1}>
                {user?.email || 'Not available'}
              </Text>
            </View>
            
            <View style={styles.profileDivider} />
            
            <TouchableOpacity 
              style={styles.profileRow}
              onPress={handleCopyUserId}
            >
              <Text style={styles.profileLabel}>User ID</Text>
              <View style={styles.profileValueContainer}>
                <Text style={styles.profileValueMono} numberOfLines={1}>
                  {user?.id ? `${user.id.slice(0, 8)}...` : 'Not available'}
                </Text>
                <Text style={styles.copyIcon}>📋</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.profileDivider} />
            
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Member Since</Text>
              <Text style={styles.profileValue}>
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    }) 
                  : 'Not available'
                }
              </Text>
            </View>
          </Card>
        </View>

        {/* Order History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order History</Text>
          
          {ordersLoading ? (
            <Card elevation="e1" style={styles.loadingCard}>
              <ActivityIndicator size="small" color={colors.navy} />
              <Text style={styles.loadingText}>Loading orders...</Text>
            </Card>
          ) : ordersError ? (
            <Card elevation="e1" style={styles.errorCard}>
              <Text style={styles.errorText}>Unable to load order history</Text>
              <Text style={styles.errorSubtext}>Please try again later</Text>
            </Card>
          ) : orders.length === 0 ? (
            <Card elevation="e1" style={styles.emptyOrdersCard}>
              <Text style={styles.emptyOrdersIcon}>📦</Text>
              <Text style={styles.emptyOrdersTitle}>No orders yet</Text>
              <Text style={styles.emptyOrdersText}>Your order history will appear here</Text>
            </Card>
          ) : (
            <>
              <FlatList
                data={displayedOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.ordersList}
              />
              
              {orders.length > 3 && (
                <Button
                  title={showAllOrders ? 'Show Less' : `Show All ${orders.length} Orders`}
                  onPress={() => setShowAllOrders(!showAllOrders)}
                  variant="ghost"
                  size="medium"
                  style={styles.showMoreButton}
                />
              )}
            </>
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <Card elevation="e1" style={styles.actionsCard}>
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="secondary"
              size="large"
            />
          </Card>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },

  // Header Styles
  header: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    backgroundColor: colors.ivory,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  headerTitle: {
    fontSize: typography.title.size,
    lineHeight: typography.title.lineHeight,
    fontWeight: typography.title.weight,
    color: colors.navy,
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.heading.size,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.weight,
    color: colors.navy,
    marginBottom: spacing.l,
  },

  // Profile Card Styles
  profileCard: {
    padding: spacing.l,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  profileLabel: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  profileValue: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    color: colors.text,
    flex: 2,
    textAlign: 'right',
  },
  profileValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  profileValueMono: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    color: colors.navy,
    fontFamily: 'monospace',
    textDecorationLine: 'underline',
  },
  profileDivider: {
    height: 1,
    backgroundColor: colors.silver,
    marginVertical: spacing.m,
  },
  copyIcon: {
    fontSize: 14,
    marginLeft: spacing.s,
  },

  // Order History Styles
  loadingCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
    marginTop: spacing.s,
  },
  errorCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.body.size,
    color: colors.danger,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  errorSubtext: {
    fontSize: typography.caption.size,
    color: colors.textSecondary,
  },
  emptyOrdersCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyOrdersIcon: {
    fontSize: 48,
    marginBottom: spacing.m,
  },
  emptyOrdersTitle: {
    fontSize: typography.heading.size,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.weight,
    color: colors.navy,
    marginBottom: spacing.s,
  },
  emptyOrdersText: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    color: colors.textSecondary,
  },

  // Orders List Styles
  ordersList: {
    gap: spacing.m,
  },
  orderCard: {
    padding: spacing.l,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.bold,
    color: colors.navy,
    fontFamily: 'monospace',
  },
  orderDate: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    color: colors.textSecondary,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  orderStatusContainer: {
    flex: 1,
  },
  orderTotal: {
    fontSize: typography.heading.size,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.weight,
    color: colors.navy,
  },
  orderItemCount: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  orderItemsList: {
    gap: spacing.xs,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderItemThumbnail: {
    width: 24,
    height: 24,
    backgroundColor: colors.silver,
    borderRadius: radius.sm,
    marginRight: spacing.s,
  },
  orderItemText: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    color: colors.text,
    flex: 1,
  },
  moreItemsText: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginLeft: spacing.xl,
  },
  showMoreButton: {
    marginTop: spacing.m,
    alignSelf: 'center',
  },

  // Actions Card Styles
  actionsCard: {
    padding: spacing.l,
  },
});