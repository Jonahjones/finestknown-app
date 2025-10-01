import { AppCard } from '@/src/components/ui';
import { colors } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchLivePrices, LivePriceData } from '../api/pricing';

// Use the LivePriceData interface from the API
type SpotPrice = LivePriceData;

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.45;
const CARD_SPACING = 16;

// Metal icons mapping
const METAL_ICONS = {
  gold: 'diamond',
  silver: 'diamond-outline',
  platinum: 'diamond-outline',
  palladium: 'diamond-outline',
} as const;

interface LiveSpotPricesProps {
  onError?: (error: string) => void;
}

export function LiveSpotPrices({ onError }: LiveSpotPricesProps) {
  const [prices, setPrices] = useState<SpotPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadPrices();
    const interval = setInterval(loadPrices, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadPrices = async () => {
    try {
      setError(null);
      const priceData = await fetchLivePrices();
      setPrices(priceData);
      setLastUpdate(new Date());
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      const errorMessage = 'Failed to load live prices';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, metal: string) => {
    if (metal.toLowerCase() === 'gold') {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const updateText = () => {
    if (loading) return 'Loading live prices...';
    if (error) return `Error: ${error}`;
    if (lastUpdate) {
      return `Last updated: ${lastUpdate.toLocaleTimeString().replace(' ', '')}`;
    }
    return 'Live prices';
  };

  if (loading && prices.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Live Spot Prices</Text>
          <Text style={styles.updateText}>{updateText()}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          snapToAlignment="start"
        >
          {[1, 2, 3, 4].map((_, index) => (
            <View key={index} style={styles.priceCard}>
              <View style={styles.priceHeader}>
                <View style={styles.metalIconContainer}>
                  <Ionicons name="diamond" size={20} color={colors.brand} />
                </View>
                <Text style={styles.metalName}>Loading...</Text>
              </View>
              <View style={styles.priceContent}>
                <Text style={styles.priceValue}>--</Text>
                <Text style={styles.priceUnit}>per oz</Text>
              </View>
              <View style={styles.priceChange}>
                <Text style={styles.changeLabel}>24h Change</Text>
                <Text style={styles.changeValue}>--</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (error && prices.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Live Spot Prices</Text>
          <Text style={styles.updateText}>{updateText()}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={32} color={colors.danger} />
          <Text style={styles.errorText}>Unable to load live prices</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPrices}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Spot Prices</Text>
        <Text style={styles.updateText}>{updateText()}</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
      >
        {prices.map((price) => (
          <AppCard 
            key={price.metal} 
            variant="tile"
            style={styles.priceCard}
            testID="priceCard"
          >
            <View style={styles.priceHeader}>
              <Ionicons 
                name={METAL_ICONS[price.metal as keyof typeof METAL_ICONS] as any} 
                size={24} 
                color={colors.brand} 
              />
              <Text style={styles.metalName}>{price.metal}</Text>
            </View>
            
            <View style={styles.priceContent}>
              <Text style={styles.priceValue}>
                {formatPrice(price.price, price.metal)}
              </Text>
              <Text style={styles.priceUnit}>per oz</Text>
            </View>
            
            <View style={styles.priceChange}>
              <Text style={styles.changeLabel}>24h Change</Text>
              <Text style={[
                styles.changeValue,
                { color: price.change >= 0 ? colors.success : colors.danger }
              ]}>
                {price.change >= 0 ? '+' : ''}{price.change.toFixed(2)}%
              </Text>
            </View>
          </AppCard>
        ))}
      </ScrollView>
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
    color: colors.text.primary,
  },
  updateText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  priceCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginRight: CARD_SPACING,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  metalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metalName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  priceContent: {
    marginBottom: 12,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  priceUnit: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  priceChange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  changeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  retryButton: {
    backgroundColor: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '500',
  },
});