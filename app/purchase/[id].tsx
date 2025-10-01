import { requestDirectPurchase } from '@/src/api/checkout';
import { getProduct } from '@/src/api/products';
import { borderRadius, colors, spacing, typography } from '@/src/design/tokens';
import { testDirectCheckout } from '@/src/utils/testDirectCheckout';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PurchaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Direct checkout mutation for Buy Now
  const directCheckout = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error('Product not found');
      return await requestDirectPurchase(product.id, quantity);
    },
    onSuccess: ({ order_id, total_cents }) => {
      const formattedTotal = (total_cents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      });
      
      Alert.alert(
        "🎉 Order Confirmed!", 
        `Thank you for your purchase!\n\nOrder ID: ${order_id}\nTotal: ${formattedTotal}\n\nYour order has been placed successfully. You will receive a confirmation email shortly.`,
        [
          {
            text: "Continue Shopping",
            onPress: () => router.push('/(tabs)/catalog')
          },
          {
            text: "View Order",
            onPress: () => router.push(`/account/orders/${order_id}`)
          }
        ]
      );
    },
    onError: (error) => {
      Alert.alert("Purchase Error", error.message || "Failed to complete purchase");
    }
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getImageUrl = (photos: string[]) => {
    if (!photos || photos.length === 0) {
      return 'https://via.placeholder.com/800x800/e5e7eb/9ca3af?text=No+Image';
    }
    return photos[0];
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Purchase</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.navy} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Purchase</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(tabs)/catalog')}
          >
            <Text style={styles.buttonText}>Browse Catalog</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = quantity * product.price_cents;
  const shipping = 0; // Free shipping
  const tax = Math.round(subtotal * 0.08); // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Purchase</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Summary */}
        <View style={styles.productSummary}>
          <Image
            source={{ uri: getImageUrl(product.photos) }}
            style={styles.productImage}
            resizeMode="contain"
          />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {product.title}
            </Text>
            <Text style={styles.productPrice}>
              {formatPrice(product.price_cents)} each
            </Text>
            {product.sku && (
              <Text style={styles.productSku}>SKU: {product.sku}</Text>
            )}
          </View>
        </View>

        {/* Quantity Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Subtotal ({quantity} item{quantity > 1 ? 's' : ''})
            </Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {shipping === 0 ? 'FREE' : formatPrice(shipping)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>{formatPrice(tax)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Purchase Button */}
      <View style={styles.footer}>
        {/* Debug Test Button - Remove in production */}
        <TouchableOpacity
          onPress={async () => {
            const result = await testDirectCheckout();
            Alert.alert(
              result.success ? "✅ Test Passed" : "❌ Test Failed",
              result.success 
                ? `${result.message}\n\nTest product: ${result.testProduct?.title}`
                : `Error: ${result.error}\n\nCheck console for more details.`
            );
          }}
          style={[styles.testButton]}
        >
          <Text style={styles.testButtonText}>🧪 Test Checkout Setup</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.purchaseButton, { opacity: directCheckout.isPending ? 0.7 : 1 }]}
          onPress={() => directCheckout.mutate()}
          disabled={directCheckout.isPending}
        >
          <Text style={styles.purchaseButtonText}>
            {directCheckout.isPending ? 'Processing...' : `Purchase Now - ${formatPrice(total)}`}
          </Text>
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
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate + '20',
  },
  backButton: {
    fontSize: typography.sizes.base,
    color: colors.navy,
    fontWeight: typography.weights.semibold,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.navy,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.slate,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.red,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.white,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  productSummary: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  productPrice: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  productSku: {
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  section: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: colors.navy + '10',
    borderRadius: borderRadius.sm,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.navy + '20',
  },
  quantityButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.navy,
  },
  quantityText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
    marginHorizontal: spacing.lg,
    minWidth: 40,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.base,
    color: colors.slate,
  },
  summaryValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.slate + '20',
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.navy,
  },
  totalValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.navy,
  },
  footer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.slate + '20',
  },
  purchaseButton: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  testButton: {
    backgroundColor: colors.slate + '20',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  testButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.slate,
  },
});
