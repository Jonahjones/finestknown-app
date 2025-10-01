import { AppHeader } from '@/src/components/AppHeader';
import { FeaturedDrops } from '@/src/components/FeaturedDrops';
import { FinestKnownLogo } from '@/src/components/FinestKnownLogo';
import { FlashSaleCarousel } from '@/src/components/FlashSaleCarousel';
import { ResourceItem, SectionHeader } from '@/src/components/home';
import { colors, radii, shadow, spacing, type } from '@/src/theme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Categories data
const categories = [
  { id: '1', name: 'Gold', count: 24, icon: 'diamond' },
  { id: '2', name: 'Silver', count: 18, icon: 'diamond' },
  { id: '3', name: 'Platinum', count: 12, icon: 'diamond' },
  { id: '4', name: 'Palladium', count: 8, icon: 'diamond' },
];

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

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/catalog?category=${categoryId}`);
  };

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
          <View style={styles.latestProductsGrid}>
            {categories.map((category) => (
              <TouchableOpacity 
                key={`latest-${category.id}`} 
                style={styles.latestProductItem} 
                onPress={() => handleCategoryPress(category.id)}
              >
                <Text style={styles.latestProductName}>{category.name} Collection</Text>
                <Text style={styles.latestProductPrice}>From $299</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    gap: spacing.md,
  },
  latestProductItem: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
    gap: spacing.xs,
  },
  latestProductName: {
    ...type.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  latestProductPrice: {
    ...type.meta,
    color: colors.brand,
    fontWeight: '700',
  },
});