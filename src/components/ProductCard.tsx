import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, Image, Modal, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProductRow } from '../api/products';
import { useAddToCartMutation } from '../hooks/useCart';
import { colors, radii, shadow, spacing, touchTarget, type } from '../theme';

interface ProductCardProps {
  product: ProductRow;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  showQuickView?: boolean;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ 
  product, 
  onToggleFavorite, 
  isFavorite = false,
  showQuickView = true,
  viewMode = 'grid'
}: ProductCardProps) {
  const [quickViewVisible, setQuickViewVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  
  const addToCartMutation = useAddToCartMutation();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/product/${product.id}`);
  };

  const handleLongPress = () => {
    if (showQuickView) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setQuickViewVisible(true);
    }
  };

  const handleAddToCart = useCallback((e: any) => {
    e.stopPropagation();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    addToCartMutation.mutate({
      productId: product.id,
      qty: 1,
      price_cents: product.price_cents,
    });

    // Show toast
    setShowToast(true);
    Animated.sequence([
      Animated.spring(toastAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowToast(false));
  }, [product.id, product.price_cents, addToCartMutation, toastAnim]);

  const handleFavorite = useCallback((e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleFavorite?.(product.id);
  }, [product.id, onToggleFavorite]);

  const handleShare = useCallback(async (e: any) => {
    e.stopPropagation();
    try {
      await Share.share({
        message: `Check out ${product.title} - $${(product.price_cents / 100).toFixed(2)}`,
        url: `finestknown://product/${product.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [product]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const isSoldOut = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;
  // Note: created_at not available in ProductRow type, so we can't check for "NEW" badge
  const isNew = false;

  // List view rendering
  if (viewMode === 'list') {
    return (
      <Animated.View style={[styles.listContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handleLongPress}
          style={[styles.listCard, isSoldOut && styles.soldCard]}
          activeOpacity={0.9}
        >
          {/* Image */}
          <View style={styles.listImageContainer}>
            <Image
              source={{ 
                uri: product.photos[0] || 'https://via.placeholder.com/200x200/F7F6F3/C8A34A?text=No+Image' 
              }}
              style={[styles.listImage, isSoldOut && styles.soldImage]}
              resizeMode="cover"
            />
            {/* Only show SOLD badge in list view - stock indicator handles low stock */}
            {isSoldOut && (
              <View style={styles.saleBadge}>
                <Text style={styles.saleBadgeText}>SOLD</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.listContent}>
            <View style={styles.listHeader}>
              <Text style={styles.title} numberOfLines={2}>
                {product.title}
              </Text>
              {onToggleFavorite && (
                <TouchableOpacity onPress={handleFavorite} style={styles.favoriteButton}>
                  <Ionicons 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    size={20} 
                    color={isFavorite ? colors.danger : colors.text.secondary} 
                  />
                </TouchableOpacity>
              )}
            </View>

            {product.description && (
              <Text style={styles.listDescription} numberOfLines={2}>
                {product.description}
              </Text>
            )}

            <View style={styles.listFooter}>
              <View>
                <Text style={styles.price}>
                  ${(product.price_cents / 100).toFixed(2)}
                </Text>
                {/* Stock indicator with dot - cleaner than badge */}
                {!isSoldOut && (
                  <View style={styles.stockRow}>
                    <View style={[
                      styles.stockDot,
                      isLowStock && styles.lowStockDot
                    ]} />
                    <Text style={[
                      styles.stockText,
                      isLowStock && styles.lowStockText
                    ]}>
                      {isLowStock ? 'Low Stock' : 'In Stock'}
                    </Text>
                  </View>
                )}
              </View>

              {!isSoldOut && (
                <TouchableOpacity 
                  style={styles.listAddButton}
                  onPress={handleAddToCart}
                >
                  <Ionicons name="cart-outline" size={18} color={colors.surface} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Grid view rendering (default)
  return (
    <>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handleLongPress}
          style={[styles.card, isSoldOut && styles.soldCard]}
          activeOpacity={0.9}
        >
          {/* Image Container with 4:3 aspect ratio */}
          <View style={styles.imageContainer}>
            <Image
              source={{ 
                uri: product.photos[imageIndex] || 'https://via.placeholder.com/400x300/F7F6F3/C8A34A?text=No+Image' 
              }}
              style={[styles.image, isSoldOut && styles.soldImage]}
              resizeMode="cover"
            />
            
            {/* Category chip - top left */}
            {product.metal && (
              <View style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{product.metal}</Text>
              </View>
            )}
            
            {/* Badges - top right */}
            <View style={styles.badgeContainer}>
              {isSoldOut && (
                <View style={[styles.badge, styles.soldBadge]}>
                  <Text style={styles.badgeText}>SOLD</Text>
                </View>
              )}
              {!isSoldOut && isNew && (
                <View style={[styles.badge, styles.newBadge]}>
                  <Text style={styles.badgeText}>NEW</Text>
                </View>
              )}
              {/* LOW STOCK badge removed - stock indicator dot handles this */}
            </View>

            {/* Image pagination dots */}
            {product.photos.length > 1 && (
              <View style={styles.paginationDots}>
                {product.photos.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      idx === imageIndex && styles.activeDot
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Action buttons overlay */}
            <View style={styles.actionButtons}>
              {onToggleFavorite && (
                <TouchableOpacity onPress={handleFavorite} style={styles.actionButton}>
                  <Ionicons 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    size={20} 
                    color={isFavorite ? colors.danger : colors.surface} 
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color={colors.surface} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {product.title}
            </Text>
            
            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                ${(product.price_cents / 100).toFixed(2)}
              </Text>
            </View>
            
            {/* Stock indicator */}
            {!isSoldOut && (
              <View style={styles.stockRow}>
                <View style={[
                  styles.stockDot,
                  isLowStock && styles.lowStockDot
                ]} />
                <Text style={[
                  styles.stockText,
                  isLowStock && styles.lowStockText
                ]}>
                  {isLowStock ? 'Low Stock' : 'In Stock'}
                </Text>
              </View>
            )}
            
            {/* Add to Cart Button */}
            {!isSoldOut && (
              <TouchableOpacity 
                style={styles.addToCartButton}
                onPress={handleAddToCart}
              >
                <Ionicons name="cart-outline" size={16} color={colors.surface} />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Toast notification */}
      {showToast && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.toastText}>Added to cart</Text>
        </Animated.View>
      )}

      {/* Quick View Modal */}
      {showQuickView && (
        <Modal
          visible={quickViewVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setQuickViewVisible(false)}
        >
          <View style={styles.quickViewOverlay}>
            <View style={styles.quickViewContainer}>
              <TouchableOpacity
                style={styles.quickViewClose}
                onPress={() => setQuickViewVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  source={{ 
                    uri: product.photos[0] || 'https://via.placeholder.com/400x400/F7F6F3/C8A34A?text=No+Image' 
                  }}
                  style={styles.quickViewImage}
                  resizeMode="contain"
                />

                <View style={styles.quickViewContent}>
                  <Text style={styles.quickViewTitle}>{product.title}</Text>
                  <Text style={styles.quickViewPrice}>
                    ${(product.price_cents / 100).toFixed(2)}
                  </Text>

                  {product.description && (
                    <Text style={styles.quickViewDescription}>
                      {product.description}
                    </Text>
                  )}

                  <View style={styles.quickViewActions}>
                    <TouchableOpacity
                      style={styles.quickViewButton}
                      onPress={() => {
                        setQuickViewVisible(false);
                        handlePress();
                      }}
                    >
                      <Text style={styles.quickViewButtonText}>View Details</Text>
                    </TouchableOpacity>
                    
                    {!isSoldOut && (
                      <TouchableOpacity
                        style={[styles.quickViewButton, styles.quickViewPrimaryButton]}
                        onPress={(e) => {
                          handleAddToCart(e);
                          setQuickViewVisible(false);
                        }}
                      >
                        <Ionicons name="cart-outline" size={18} color={colors.surface} />
                        <Text style={styles.quickViewPrimaryButtonText}>Add to Cart</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadow.card,
  },
  soldCard: {
    opacity: 0.85,
  },
  
  // Image Container with 4:3 aspect ratio
  imageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  soldImage: {
    opacity: 0.5,
  },
  
  // Category chip - top left
  categoryChip: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.surface,
    opacity: 0.9,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  categoryChipText: {
    ...type.meta,
    fontWeight: '700',
    color: colors.text.primary,
  },
  
  // Badges container
  badgeContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  soldBadge: {
    backgroundColor: colors.danger,
  },
  newBadge: {
    backgroundColor: colors.success,
  },
  lowStockBadge: {
    backgroundColor: '#FF9500', // Orange
  },
  badgeText: {
    ...type.meta,
    fontWeight: '700',
    color: colors.surface,
  },
  saleBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  saleBadgeText: {
    ...type.meta,
    fontWeight: '700',
    color: colors.surface,
  },
  
  // Pagination dots
  paginationDots: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  activeDot: {
    opacity: 1,
  },

  // Action buttons
  actionButtons: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  
  // Content
  content: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 18,
    minHeight: 36, // 2 lines: 18 * 2
    marginBottom: 6,
  },
  
  // Price
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  
  // Stock indicator
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 4,
  },
  lowStockDot: {
    backgroundColor: colors.danger,
  },
  stockText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  lowStockText: {
    color: colors.danger,
  },
  
  // Add to Cart button - Flash Sales style
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.sticky,
    zIndex: 1000,
  },
  toastText: {
    ...type.body,
    color: colors.text.primary,
    fontWeight: '600',
  },

  // Quick View Modal
  quickViewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  quickViewContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    width: '100%',
    maxHeight: '80%',
    ...shadow.sticky,
  },
  quickViewClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickViewImage: {
    width: '100%',
    height: 300,
    backgroundColor: colors.bg,
  },
  quickViewContent: {
    padding: spacing.lg,
  },
  quickViewTitle: {
    ...type.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  quickViewPrice: {
    ...type.h2,
    color: colors.brand,
    marginBottom: spacing.md,
  },
  quickViewDescription: {
    ...type.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  quickViewActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickViewButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickViewButtonText: {
    ...type.body,
    color: colors.brand,
    fontWeight: '700',
  },
  quickViewPrimaryButton: {
    backgroundColor: colors.brand,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  quickViewPrimaryButtonText: {
    ...type.body,
    color: colors.surface,
    fontWeight: '700',
  },

  // List view styles
  listContainer: {
    marginBottom: spacing.md,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    padding: spacing.md,
    ...shadow.card,
  },
  listImageContainer: {
    width: 100,
    height: 100,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.border,
    position: 'relative',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listContent: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  listDescription: {
    ...type.meta,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});