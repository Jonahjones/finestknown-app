import { getCurrentSalePrice } from '@/src/api/discounts';
import { getProduct } from '@/src/api/products';
import { Button, Card, SkeletonImage, SkeletonText } from '@/src/components/ui';
import { colors, radius, shadows, spacing, typography } from '@/src/design/tokens';
import { useAddToCartMutation } from '@/src/hooks/useCart';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Clipboard,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');
const imageHeight = screenWidth * 0.8; // 4:5 aspect ratio

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: salePriceData } = useQuery({
    queryKey: ['salePrice', id],
    queryFn: () => getCurrentSalePrice(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const addToCartMutation = useAddToCartMutation();

  // Override success handler for UI feedback
  const handleAddToCart = () => {
    if (!product) return;
    
    // Use sale price if available, otherwise use regular price
    const priceToUse = salePriceData && salePriceData.percentOff > 0 
      ? Math.round(salePriceData.salePrice * 100) 
      : product.price_cents;
    
    addToCartMutation.mutate(
      { productId: product.id, qty: 1, price_cents: priceToUse },
      {
        onSuccess: () => {
          Alert.alert("Added to Cart", "Item has been added to your cart", [
            { text: "Continue Shopping", style: "cancel" },
            { text: "View Cart", onPress: () => router.push("/(tabs)/cart") }
          ]);
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message || "Failed to add to cart");
        }
      }
    );
  };

  const getImageUrls = (photos: string[]) => {
    if (!photos || photos.length === 0) {
      return ['https://via.placeholder.com/400x500/F8F7F4/C9D1D9?text=No+Image'];
    }
    return photos;
  };


  const handleBuyNow = () => {
    if (product) {
      router.push(`/purchase/${product.id}`);
    }
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert("Copied", `${label} copied to clipboard`);
  };

  const handleOpenPopulation = () => {
    if (product?.population_url) {
      Linking.openURL(product.population_url);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.modernHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="share-outline" size={24} color={colors.navy} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="heart-outline" size={24} color={colors.navy} />
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Skeleton */}
          <View style={styles.imageGallery}>
            <SkeletonImage height={imageHeight} />
          </View>
          
          {/* Content Skeletons */}
          <Card elevation="e1" style={styles.detailsCard}>
            <SkeletonText width="80%" />
            <SkeletonText width="40%" />
            <View style={styles.skeletonSpacing} />
            <SkeletonText width="60%" />
            <SkeletonText width="70%" />
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.modernHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
          </View>
          <Text style={styles.errorTitle}>Product Not Found</Text>
          <Text style={styles.errorText}>This item may have been removed or is no longer available.</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => router.back()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const images = getImageUrls(product.photos);
  const specs = [
    { label: 'Metal', value: product.metal ? product.metal.charAt(0).toUpperCase() + product.metal.slice(1) : null },
    { label: 'Year', value: product.year?.toString() },
    { label: 'Grade', value: product.grade && product.grader ? `${product.grader} ${product.grade}` : product.grade },
    { label: 'Cert #', value: product.cert_number, copyable: true },
    { label: 'SKU', value: product.sku, copyable: true },
  ].filter(spec => spec.value);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.modernHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.navy} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={colors.navy} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? colors.danger : colors.navy} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setCurrentImageIndex(index);
            }}
            style={styles.imageScroller}
          >
            {images.map((imageUrl, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
          
          {/* Dot Indicators */}
          {images.length > 1 && (
            <View style={styles.dotIndicators}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentImageIndex && styles.dotActive
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Details */}
        <Card elevation="e1" style={styles.detailsCard}>
          <Text style={styles.title}>{product.title}</Text>
          
          <View style={styles.priceRow}>
            {salePriceData && salePriceData.percentOff > 0 ? (
              <View style={styles.salePriceContainer}>
                <View style={styles.priceContainer}>
                  <Text style={styles.salePrice}>
                    ${(salePriceData.salePrice * 100 / 100).toFixed(2)}
                  </Text>
                  <Text style={styles.originalPrice}>
                    ${(salePriceData.basePrice * 100 / 100).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{salePriceData.percentOff}%</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.priceTag}>
                ${(product.price_cents / 100).toFixed(2)}
              </Text>
            )}
            
            {/* SOLD Badge */}
            {product.stock === 0 && (
              <View style={styles.largeSoldBadge}>
                <Text style={styles.largeSoldBadgeText}>SOLD</Text>
              </View>
            )}
          </View>
          
          {product.stock === 0 ? (
            <Text style={styles.soldHint}>This piece has found a home</Text>
          ) : (
            <View style={styles.stockInfo}>
              <Text style={styles.stockCount}>Stock: {product.stock}</Text>
              <Text style={styles.stockHint}>Ships in 2–3 business days</Text>
            </View>
          )}
        </Card>

        {/* Specifications Grid */}
        <Card elevation="e1" style={styles.specsCard}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specsGrid}>
            {specs.map((spec, index) => (
              <View key={index} style={styles.specRow}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <TouchableOpacity
                  onPress={spec.copyable ? () => handleCopyToClipboard(spec.value!, spec.label) : undefined}
                  style={styles.specValueContainer}
                >
                  <Text style={[
                    styles.specValue,
                    spec.copyable && styles.specValueCopyable
                  ]}>
                    {spec.value}
                  </Text>
                  {spec.copyable && (
                    <Text style={styles.copyIcon}>📋</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Card>

        {/* Trust Row */}
        <Card elevation="e1" style={styles.trustCard}>
          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <Text style={styles.trustIcon}>🛡️</Text>
              <Text style={styles.trustText}>Authenticity{'\n'}Guaranteed</Text>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustIcon}>📦</Text>
              <Text style={styles.trustText}>Insured{'\n'}Shipping</Text>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustIcon}>↩️</Text>
              <Text style={styles.trustText}>30-day{'\n'}Return</Text>
            </View>
          </View>
        </Card>

        {/* Population Report */}
        {product.population_url && (
          <Card elevation="e1" style={styles.populationCard}>
            <Button
              title="View Population Report"
              onPress={handleOpenPopulation}
              variant="secondary"
              size="large"
            />
          </Card>
        )}

        {/* Bottom spacing for sticky bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Sticky Bottom Bar - Hidden for sold items */}
      {product.stock > 0 ? (
        <View style={styles.stickyBottomBar}>
          <Button
            title={addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            onPress={handleAddToCart}
            disabled={addToCartMutation.isPending}
            variant="secondary"
            size="large"
            style={styles.addToCartButton}
          />
          <Button
            title="Buy Now"
            onPress={handleBuyNow}
            variant="primary"
            size="large"
            style={styles.buyNowButton}
          />
        </View>
      ) : (
        <View style={styles.soldBottomBar}>
          <Text style={styles.soldMessage}>
            This piece has found a home. Explore similar items below.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  // Modern Header
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    backgroundColor: colors.cardBackground,
    ...shadows.e1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.platinum,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.platinum,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },

  // Image Gallery Styles
  imageGallery: {
    backgroundColor: colors.bg,
    marginBottom: spacing.m,
  },
  imageScroller: {
    height: imageHeight,
  },
  imageContainer: {
    width: screenWidth,
    height: imageHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.l,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
  },
  dotIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.m,
    gap: spacing.s,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.silver,
  },
  dotActive: {
    backgroundColor: colors.navy,
    width: 24,
    borderRadius: 4,
  },

  // Details Card Styles
  detailsCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.m,
    padding: spacing.l,
  },
  title: {
    fontSize: typography.title.size,
    lineHeight: typography.title.lineHeight,
    fontWeight: typography.title.weight,
    color: colors.navy,
    marginBottom: spacing.m,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  priceTag: {
    flex: 1,
    fontSize: typography.title.size,
    fontWeight: typography.title.weight,
    color: colors.navy,
  },
  salePriceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  salePrice: {
    fontSize: typography.title.size,
    fontWeight: typography.title.weight,
    color: colors.danger,
  },
  originalPrice: {
    fontSize: typography.body.size,
    fontWeight: typography.body.fontWeight,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  discountText: {
    color: colors.cardBackground,
    fontSize: typography.caption.size,
    fontWeight: '700',
  },
  largeSoldBadge: {
    backgroundColor: colors.ivory,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 8,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    marginLeft: spacing.m,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  largeSoldBadgeText: {
    fontSize: typography.body.size,
    fontWeight: typography.heading.weight,
    color: colors.navy,
    textAlign: 'center',
    letterSpacing: 1,
  },
  stockInfo: {
    marginBottom: spacing.s,
  },
  stockCount: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    color: colors.success,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  stockHint: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    color: colors.success,
    fontWeight: typography.weights.medium,
  },
  soldHint: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    fontStyle: 'italic',
  },

  // Specifications Card Styles
  specsCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.m,
    padding: spacing.l,
  },
  sectionTitle: {
    fontSize: typography.heading.size,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.weight,
    color: colors.navy,
    marginBottom: spacing.l,
  },
  specsGrid: {
    gap: spacing.m,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
  },
  specLabel: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    width: 80,
  },
  specValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  specValue: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    color: colors.textPrimary,
    fontFamily: 'monospace',
    flex: 1,
  },
  specValueCopyable: {
    color: colors.navy,
    textDecorationLine: 'underline',
  },
  copyIcon: {
    fontSize: 14,
    marginLeft: spacing.s,
  },

  // Trust Card Styles
  trustCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.m,
    padding: spacing.l,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustIcon: {
    fontSize: 24,
    marginBottom: spacing.s,
  },
  trustText: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: typography.weights.medium,
  },

  // Population Card Styles
  populationCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.m,
    padding: spacing.l,
  },

  // Sticky Bottom Bar Styles
  stickyBottomBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.m,
    ...shadows.sticky,
  },
  addToCartButton: {
    flex: 1,
  },
  buyNowButton: {
    flex: 1,
  },
  soldBottomBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    ...shadows.sticky,
  },
  soldMessage: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: spacing.xxl,
  },

  // Loading & Error States
  skeletonSpacing: {
    height: spacing.l,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.platinum,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  errorTitle: {
    fontSize: typography.title.size,
    lineHeight: typography.title.lineHeight,
    fontWeight: typography.title.weight,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  errorText: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorButton: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: radius.md,
  },
  errorButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.ivory,
  },
});
