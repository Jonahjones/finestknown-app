import { useCartItemCount, useCartQuery, useRemoveFromCartMutation, useUpdateCartQuantityMutation } from '@/src/hooks/useCart';
import { colors, radii, shadow, spacing, touchTarget, type } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
  const { data: cartItems, isLoading } = useCartQuery();
  const { data: itemCount } = useCartItemCount();
  const removeFromCartMutation = useRemoveFromCartMutation();
  const updateQuantityMutation = useUpdateCartQuantityMutation();

  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCartMutation.mutate(itemId),
        },
      ]
    );
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      handleRemoveItem(productId);
    } else {
      updateQuantityMutation.mutate({ productId, qty: newQuantity });
    }
  };

  const calculateTotal = () => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total: number, item: any) => total + (item.price_snapshot_cents * item.qty), 0);
  };

  const handleItemPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.cartItem}
      onPress={() => handleItemPress(item.product_id)}
      activeOpacity={0.7}
    >
      {/* Thumbnail - 72px */}
      <Image 
        source={{ uri: item.products?.photos[0] || 'https://via.placeholder.com/72/F7F6F3/C8A34A?text=No+Image' }} 
        style={styles.itemImage} 
      />
      
      {/* Name + Price Stack */}
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.products?.title || 'Unknown Product'}
        </Text>
        <Text style={styles.itemPrice}>
          ${(item.price_snapshot_cents / 100).toFixed(2)}
        </Text>
      </View>
      
      {/* Quantity Stepper - Right */}
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={(e) => {
            e.stopPropagation();
            handleQuantityChange(item.product_id, item.qty - 1);
          }}
        >
          <Ionicons name="remove" size={16} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.qty}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={(e) => {
            e.stopPropagation();
            handleQuantityChange(item.product_id, item.qty + 1);
          }}
        >
          <Ionicons name="add" size={16} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.loadingText}>Loading cart...</Text>
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
          <Ionicons name="bag-outline" size={64} color={colors.text.secondary} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add some precious metals to get started
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/catalog')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cart</Text>
        <Text style={styles.itemCount}>{itemCount || 0} items</Text>
      </View>

      <FlatList
        data={Array.isArray(cartItems) ? cartItems : []}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.product_id}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.checkoutContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            ${(calculateTotal() / 100).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
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
  },
  title: {
    ...type.h2,
    color: colors.text.primary,
  },
  itemCount: {
    ...type.meta,
  },
  cartList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100, // Space for checkout bar
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
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
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
  },
  itemPrice: {
    ...type.title,
    color: colors.text.primary,
    fontWeight: '700',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
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
    minWidth: 24,
    textAlign: 'center',
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow.sticky,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: {
    ...type.title,
    color: colors.text.secondary,
  },
  totalAmount: {
    ...type.h2,
    color: colors.text.primary,
  },
  checkoutButton: {
    backgroundColor: colors.brand,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    minHeight: touchTarget.minHeight,
  },
  checkoutButtonText: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...type.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...type.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: colors.brand,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginTop: spacing.xl,
    minHeight: touchTarget.minHeight,
  },
  shopButtonText: {
    ...type.title,
    color: colors.surface,
    fontWeight: '700',
  },
});