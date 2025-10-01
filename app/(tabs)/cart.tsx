import { colors, spacing, typography } from '@/src/design/tokens';
import { useCartItemCount, useCartQuery, useRemoveFromCartMutation, useUpdateCartQuantityMutation } from '@/src/hooks/useCart';
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
    >
      <Image source={{ uri: item.products?.photos[0] || 'https://via.placeholder.com/300x200/F8F7F4/C9D1D9?text=No+Image' }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.products?.title || 'Unknown Product'}
        </Text>
        <Text style={styles.itemMetal}>Precious Metal</Text>
        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>
            ${(item.price_snapshot_cents / 100).toFixed(2)}
          </Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={(e) => {
                e.stopPropagation();
                handleQuantityChange(item.product_id, item.qty - 1);
              }}
            >
              <Ionicons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.qty}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={(e) => {
                e.stopPropagation();
                handleQuantityChange(item.product_id, item.qty + 1);
              }}
            >
              <Ionicons name="add" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={(e) => {
          e.stopPropagation();
          handleRemoveItem(item.product_id);
        }}
      >
        <Ionicons name="trash" size={20} color={colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
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
          <Ionicons name="bag-outline" size={64} color={colors.textSecondary} />
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text,
    fontWeight: '700',
  },
  itemCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cartList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100, // Space for checkout bar
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    ...typography.heading,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  itemMetal: {
    ...typography.caption,
    color: colors.gold,
    marginBottom: spacing.sm,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    ...typography.title,
    color: colors.text,
    fontWeight: '700',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ivory,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginHorizontal: spacing.sm,
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: {
    ...typography.title,
    color: colors.text,
    fontWeight: '600',
  },
  totalAmount: {
    ...typography.title,
    color: colors.text,
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  checkoutButtonText: {
    ...typography.heading,
    color: colors.cardBackground,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  shopButtonText: {
    ...typography.heading,
    color: colors.cardBackground,
    fontWeight: '600',
  },
});