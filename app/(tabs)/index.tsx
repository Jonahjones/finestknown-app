import { AppHeader } from '@/src/components/AppHeader';
import { FeaturedDrops } from '@/src/components/FeaturedDrops';
import { FinestKnownLogo } from '@/src/components/FinestKnownLogo';
import { FlashSaleCarousel } from '@/src/components/FlashSaleCarousel';
import { ProductCard } from '@/src/components/ProductCard';
import { ResourceItem, SectionHeader } from '@/src/components/home';
import { listProducts } from '@/src/api/products';
import { colors, radii, shadow, spacing, type } from '@/src/theme';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Typing animation titles
const typingTitles = [
  'Rare Coins',
  'Gold Bullion',
  'Silver Bars',
  'Ancient Coins',
  'Precious Metals',
  'Numismatic Treasures'
];

export default function HomeScreen() {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Fetch latest 5 products
  const { data: latestProductsData, isLoading: isLoadingLatest } = useQuery({
    queryKey: ['latest-products-home'],
    queryFn: () => listProducts({ 
      page: 1, 
      pageSize: 5, 
      sort: 'newest'
    }),
  });

  useEffect(() => {
    const typeText = () => {
      const currentTitle = typingTitles[currentTitleIndex];
      
      if (!isDeleting) {
        if (displayedText.length < currentTitle.length) {
          setDisplayedText(currentTitle.substring(0, displayedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.substring(0, displayedText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentTitleIndex((prev) => (prev + 1) % typingTitles.length);
        }
      }
    };

    const timer = setTimeout(typeText, isDeleting ? 50 : 150);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentTitleIndex]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorTimer);
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
        <AppHeader title="Finest Known" showLivePrices={true} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section with Typing Animation */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <FinestKnownLogo size="large" showText={false} />
            <View style={styles.typingContainer}>
              <Text style={styles.heroTitle} numberOfLines={1} adjustsFontSizeToFit>
                {displayedText}
                {showCursor && <Text style={styles.cursor}>|</Text>}
              </Text>
            </View>
          </View>
        </View>

        {/* Flash Sale Carousel */}
        <FlashSaleCarousel />

        {/* Featured Drops */}
        <FeaturedDrops limit={6} />

        {/* Latest Products */}
        <View style={styles.section}>
          <SectionHeader 
            title="Latest Products" 
            subtitle="Newest additions to our collection"
            ctaText="View All"
            onCtaPress={() => router.push('/catalog')}
          />
          {isLoadingLatest ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.brand} />
            </View>
          ) : (
            <View style={styles.latestProductsGrid}>
              {latestProductsData?.items?.slice(0, 5).map((product) => (
                <View key={product.id} style={styles.productCardWrapper}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Resources Section */}
        <View style={styles.section}>
          <SectionHeader title="Resources" subtitle="Learn more about precious metals" />
          <ResourceItem 
            title="Investing in Gold" 
            description="Complete guide to gold investments"
            onPress={() => router.push('/resources/about')}
          />
          <ResourceItem 
            title="Coin Grading Guide" 
            description="Understanding coin grades and values"
            onPress={() => router.push('/resources/about')}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  heroSection: {
    backgroundColor: colors.bg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: width * 0.9,
    alignSelf: 'center',
  },
  typingContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.md,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  cursor: {
    color: colors.brand,
    fontSize: 48,
    fontWeight: '700',
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  // Latest Products
  latestProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  productCardWrapper: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});