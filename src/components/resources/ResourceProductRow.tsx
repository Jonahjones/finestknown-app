import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, shadows, spacing } from '../../design/tokens';
import { useAddToCartMutation } from '../../hooks/useCart';
import type { Product } from '../../types';

interface ResourceProductRowProps {
  products: Product[];
  title: string;
  isLoading?: boolean;
}

export function ResourceProductRow({
  products,
  title,
  isLoading = false,
}: ResourceProductRowProps) {
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});
  const addToCartMutation = useAddToCartMutation();

  const handleAddToCart = async (product: Product, e: any) => {
    e.stopPropagation();
    
    if (addingToCart[product.id]) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAddingToCart(prev => ({ ...prev, [product.id]: true }));

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        qty: 1,
        price_cents: product.price_cents,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleProductPress = (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/product/${productId}` as any);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const imageUri = item.photos && item.photos.length > 0 ? item.photos[0] : null;
    const price = item.price_cents ? (item.price_cents / 100).toFixed(2) : '0.00';
    const isAdding = addingToCart[item.id];

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item.id)}
        activeOpacity={0.7}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={32} color={colors.platinum} />
          </View>
        )}

        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productPrice}>${price}</Text>

          <TouchableOpacity
            style={[styles.addButton, isAdding && styles.addButtonDisabled]}
            onPress={(e) => handleAddToCart(item, e)}
            disabled={isAdding}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <>
                <Ionicons name="cart" size={14} color={colors.surface} />
                <Text style={styles.addButtonText}>Add</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </View>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  productCard: {
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.platinum,
    overflow: 'hidden',
    ...shadows.card,
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: colors.platinum,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: spacing.sm,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 16,
    minHeight: 32,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.brand,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

