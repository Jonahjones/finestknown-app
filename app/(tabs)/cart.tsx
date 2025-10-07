import { useCartItemCount, useCartQuery, useRemoveFromCartMutation, useUpdateCartQuantityMutation } from '@/src/hooks/useCart';
import { colors, radii, shadow, spacing, touchTarget, type } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
// Haptics will be added - for now using silent fallbacks
const Haptics = {
  impactAsync: async (_style?: any) => {},
  notificationAsync: async (_type?: any) => {},
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const FREE_SHIPPING_THRESHOLD = 10000; // $100 in cents

// Skeleton Loader Component
function CartItemSkeleton() {
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
    <View style={styles.cartItem}>
      <Animated.View style={[styles.skeletonImage, { opacity }]} />
      <View style={styles.itemContent}>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonPrice, { opacity }]} />
      </View>
      <Animated.View style={[styles.skeletonQuantity, { opacity }]} />
    </View>
  );
}

export default function CartScreen() {
  const { data: cartItems, isLoading, refetch } = useCartQuery();
  const itemCount = useCartItemCount();
  const removeFromCartMutation = useRemoveFromCartMutation();
  const updateQuantityMutation = useUpdateCartQuantityMutation();
  const [refreshing, setRefreshing] = useState(false);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const handleRemoveItem = async (itemId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setRemovingItems(prev => new Set(prev).add(itemId));
    
    try {
      await removeFromCartMutation.mutateAsync(itemId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setRemovingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (newQuantity === 0) {
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => handleRemoveItem(productId),
          },
        ]
      );
    } else {
      updateQuantityMutation.mutate({ productId, qty: newQuantity });
    }
  };

  const calculateSubtotal = () => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total: number, item: any) => total + (item.price_snapshot_cents * item.qty), 0);
  };

  const calculateTax = (subtotal: number) => {
    return Math.round(subtotal * 0.08); // 8% tax estimate
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  const getRemainingForFreeShipping = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  };

  const hasQualifiedForFreeShipping = getRemainingForFreeShipping() === 0;

  const handleItemPress = (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/product/${productId}`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  };

  const renderRightActions = (itemId: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleRemoveItem(itemId)}
      >
        <Ionicons name="trash-outline" size={24} color={colors.surface} />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const renderCartItem = ({ item }: { item: any }) => {
    const lineTotal = item.price_snapshot_cents * item.qty;
    const isRemoving = removingItems.has(item.product_id);

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item.product_id)}
        overshootRight={false}
      >
        <TouchableOpacity 
          style={[styles.cartItem, isRemoving && styles.cartItemRemoving]}
          onPress={() => handleItemPress(item.product_id)}
          activeOpacity={0.7}
          disabled={isRemoving}
        >
          {/* Larger Thumbnail - 100px */}
          <Image 
            source={{ uri: item.products?.photos[0] || 'https://via.placeholder.com/100/F7F6F3/C8A34A?text=No+Image' }} 
            style={styles.itemImage} 
          />
          
          {/* Name + Price Stack */}
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.products?.title || 'Unknown Product'}
            </Text>
            
            {/* Product metadata */}
            {item.products?.weight && (
              <Text style={styles.itemMeta}>
                {item.products.weight} oz • {item.products.purity || '999'}
              </Text>
            )}
            
            {/* Price per unit */}
            <Text style={styles.itemPrice}>
              ${(item.price_snapshot_cents / 100).toFixed(2)}
            </Text>

            {/* Line total if qty > 1 */}
            {item.qty > 1 && (
              <Text style={styles.lineTotal}>
                {item.qty} × ${(item.price_snapshot_cents / 100).toFixed(2)} = ${(lineTotal / 100).toFixed(2)}
              </Text>
            )}
          </View>
          
          {/* Quantity Stepper - Right */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={(e) => {
                e.stopPropagation();
                handleQuantityChange(item.product_id, item.qty - 1);
              }}
              disabled={isRemoving}
            >
              <Ionicons name="remove" size={18} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.qty}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={(e) => {
                e.stopPropagation();
                handleQuantityChange(item.product_id, item.qty + 1);
              }}
              disabled={isRemoving}
            >
              <Ionicons name="add" size={18} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Cart</Text>
        </View>
        <View style={styles.skeletonContainer}>
          <CartItemSkeleton />
          <CartItemSkeleton />
          <CartItemSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Cart</Text>
          <Text style={styles.itemCount}>{itemCount || 0} items</Text>
        </View>
        <View style={styles.emptyContainer}>
          {/* Better empty state with coin illustration */}
          <View style={styles.emptyIconContainer}>
            <Ionicons name="bag-outline" size={80} color={colors.brand} />
            <View style={styles.emptyBadge}>
              <Text style={styles.emptyBadgeText}>0</Text>
            </View>
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Discover our collection of precious metals and rare coins
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/catalog');
            }}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = calculateTotal();
  const remainingForFreeShipping = getRemainingForFreeShipping();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cart</Text>
        <Text style={styles.itemCount}>{itemCount || 0} items</Text>
      </View>

      {/* Free Shipping Banner */}
      {!hasQualifiedForFreeShipping && remainingForFreeShipping < FREE_SHIPPING_THRESHOLD && (
        <View style={styles.shippingBanner}>
          <Ionicons name="rocket-outline" size={20} color={colors.brand} />
          <Text style={styles.shippingBannerText}>
            Add <Text style={styles.shippingBannerAmount}>${(remainingForFreeShipping / 100).toFixed(2)}</Text> more for free shipping!
          </Text>
        </View>
      )}

      {hasQualifiedForFreeShipping && (
        <View style={[styles.shippingBanner, styles.shippingBannerSuccess]}>
          <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
          <Text style={styles.shippingBannerTextSuccess}>
            You've qualified for free shipping! 🎉
          </Text>
        </View>
      )}

      <FlatList
        data={Array.isArray(cartItems) ? cartItems : []}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.product_id}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
      />

      <View style={styles.checkoutContainer}>
        {/* Breakdown */}
        <View style={styles.breakdownContainer}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Subtotal</Text>
            <Text style={styles.breakdownValue}>
              ${(subtotal / 100).toFixed(2)}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Tax (estimated)</Text>
            <Text style={styles.breakdownValue}>
              ${(tax / 100).toFixed(2)}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Shipping</Text>
            <Text style={styles.breakdownValue}>
              {hasQualifiedForFreeShipping ? 'FREE' : 'Calculated at checkout'}
            </Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            ${(total / 100).toFixed(2)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/catalog');
            }}
          >
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/checkout');
            }}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...type.h2,
    color: colors.text.primary,
  },
  itemCount: {
    ...type.meta,
  },
  shippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F5E5B8',
  },
  shippingBannerSuccess: {
    backgroundColor: '#E8F5E9',
    borderBottomColor: '#C8E6C9',
  },
  shippingBannerText: {
    ...type.body,
    color: colors.text.primary,
    flex: 1,
  },
  shippingBannerTextSuccess: {
    ...type.body,
    color: '#2E7D32',
    fontWeight: '600',
    flex: 1,
  },
  shippingBannerAmount: {
    fontWeight: '700',
    color: colors.brand,
  },
  cartList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 400, // Increased to accommodate sticky checkout container
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cartItemRemoving: {
    opacity: 0.5,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: radii.md,
    backgroundColor: colors.border,
  },
  itemContent: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.md,
  },
  itemTitle: {
    ...type.title,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  itemMeta: {
    ...type.meta,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontSize: 13,
  },
  itemPrice: {
    ...type.body,
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  lineTotal: {
    ...type.meta,
    color: colors.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityButton: {
    width: touchTarget.minWidth,
    height: touchTarget.minHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    ...type.body,
    color: colors.text.primary,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
    fontSize: 16,
  },
  deleteAction: {
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    marginBottom: spacing.md,
    borderTopRightRadius: radii.md,
    borderBottomRightRadius: radii.md,
  },
  deleteText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow.sticky,
  },
  breakdownContainer: {
    marginBottom: spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  breakdownLabel: {
    ...type.body,
    color: colors.text.secondary,
  },
  breakdownValue: {
    ...type.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...type.title,
    fontSize: 20,
    color: colors.text.primary,
    fontWeight: '700',
  },
  totalAmount: {
    ...type.h2,
    color: colors.brand,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  continueButton: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.minHeight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  continueButtonText: {
    ...type.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  checkoutButton: {
    flex: 1.5,
    backgroundColor: colors.brand,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: touchTarget.minHeight,
  },
  checkoutButtonText: {
    ...type.title,
    color: colors.surface,
    fontWeight: '700',
  },
  // Skeleton styles
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  skeletonImage: {
    width: 100,
    height: 100,
    borderRadius: radii.md,
    backgroundColor: colors.border,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.xs,
    width: '80%',
  },
  skeletonPrice: {
    height: 14,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '40%',
  },
  skeletonQuantity: {
    width: 100,
    height: 44,
    backgroundColor: colors.border,
    borderRadius: radii.md,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  emptyBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#D32F2F',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  emptyBadgeText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  emptyTitle: {
    ...type.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...type.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: colors.brand,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    minHeight: touchTarget.minHeight,
  },
  shopButtonText: {
    ...type.title,
    color: colors.surface,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...type.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});
