import { FlashSaleItem, getActiveFlashSales } from '@/src/api/discounts';
import { AppCard, PriceTag } from '@/src/components/ui';
import { useAddToCartMutation } from '@/src/hooks/useCart';
import { analytics } from '@/src/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Increased width, reduced padding
const CARD_SPACING = 12; // Reduced spacing

interface FlashSaleCarouselProps {
  onEmpty?: () => void;
}

export function FlashSaleCarousel({ onEmpty }: FlashSaleCarouselProps) {
  const [items, setItems] = useState<FlashSaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const addToCartMutation = useAddToCartMutation();

  useEffect(() => {
    loadFlashSales();
  }, []);

  const loadFlashSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getActiveFlashSales();
      console.log('Flash sales response:', response);
      setItems(response.items);
      
      if (response.items.length === 0) {
        console.log('No flash sales found, calling onEmpty');
        onEmpty?.();
      }
    } catch (error) {
      console.error('Failed to load flash sales:', error);
      setError('Failed to load flash sales');
      // Show some sample data for testing
      setItems([
        {
          id: 'sample-1',
          slug: 'sample-1',
          name: 'Sample Gold Coin',
          imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
          basePrice: 1500,
          salePrice: 1200,
          percentOff: 20,
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          inventory: 5,
        },
        {
          id: 'sample-2',
          slug: 'sample-2',
          name: 'Sample Silver Bar',
          imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
          basePrice: 800,
          salePrice: 640,
          percentOff: 20,
          endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          inventory: 3,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: FlashSaleItem) => {
    analytics.track('flash_sale_item_viewed', { 
      itemId: item.id, 
      itemName: item.name 
    });
    router.push(`/product/${item.id}`);
  };

  const handleAddToCart = async (item: FlashSaleItem) => {
    try {
      analytics.track('flash_sale_add_to_cart', { 
        itemId: item.id, 
        itemName: item.name,
        price: item.salePrice 
      });
      
      await addToCartMutation.mutateAsync({
        productId: item.id,
        qty: 1,
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const formatTimeRemaining = (endsAt: string) => {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * (CARD_WIDTH + CARD_SPACING),
        animated: true,
      });
    }
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Flash Sale</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0B1B2B" />
          <Text style={styles.loadingText}>Loading flash sales...</Text>
        </View>
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Flash Sale</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={48} color="#D14343" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadFlashSales}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Flash Sale</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="flash" size={48} color="#6B7280" />
          <Text style={styles.emptyText}>No flash sales available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Flash Sale</Text>
        <View style={styles.headerDiscountBadge}>
          <Text style={styles.headerDiscountText}>UP TO 50% OFF</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_SPACING));
          setCurrentIndex(index);
        }}
        {...(Platform.OS === 'web' && {
          style: { overflowX: 'auto' },
          contentContainerStyle: { ...styles.scrollContent, display: 'flex' }
        })}
      >
        {items.map((item, index) => (
          <AppCard
            key={item.id}
            variant="promo"
            style={styles.cardContainer}
            onPress={() => handleItemPress(item)}
            testID="flashSaleCard"
          >
            <Image
              source={{ uri: item.imageUrl || 'https://via.placeholder.com/200x200/F8F7F4/C9D1D9?text=No+Image' }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.cardDiscountBadge}>
              <Text style={styles.cardDiscountText}>{item.percentOff}% OFF</Text>
            </View>
            
            <View style={styles.content}>
              <Text style={styles.itemName} numberOfLines={2} ellipsizeMode="tail">
                {item.name}
              </Text>
              
              <PriceTag
                price={Math.round(item.salePrice * 100)}
                oldPrice={Math.round(item.basePrice * 100)}
                size="medium"
                showDiscount={true}
              />
              
              <View style={styles.countdown}>
                <Ionicons name="time" size={14} color="#D14343" />
                <Text style={styles.countdownText}>
                  Ends in {formatTimeRemaining(item.endsAt)}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => handleAddToCart(item)}
                disabled={addToCartMutation.isPending}
              >
                {addToCartMutation.isPending ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.addToCartText}>Adding...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="cart" size={16} color="#FFFFFF" />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </AppCard>
        ))}
      </ScrollView>

      {items.length > 1 && (
        <View style={styles.pagination}>
          {items.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
              onPress={() => scrollToIndex(index)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0E2033',
  },
  headerDiscountBadge: {
    backgroundColor: '#D14343',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  headerDiscountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#D14343',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0B1B2B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: '#F6F7F8',
  },
  cardDiscountBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#D14343',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  cardDiscountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E2033',
    marginBottom: 8,
    lineHeight: 16,
    height: 32, // Fixed height for 2 lines
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    height: 24, // Fixed height
  },
  salePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0E2033',
  },
  oldPrice: {
    fontSize: 13,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    paddingVertical: 4,
    height: 24, // Fixed height
  },
  countdownText: {
    fontSize: 13,
    color: '#D14343',
    fontWeight: '600',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1B2B',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    height: 44, // Fixed height
    marginTop: 'auto', // Push to bottom
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F6F7F8',
  },
  paginationDotActive: {
    backgroundColor: '#0B1B2B',
  },
});