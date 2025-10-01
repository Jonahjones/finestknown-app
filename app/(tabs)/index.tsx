import { AppHeader } from '@/src/components/AppHeader';
import { FeaturedDrops } from '@/src/components/FeaturedDrops';
import { FinestKnownLogo } from '@/src/components/FinestKnownLogo';
import { FlashSaleCarousel } from '@/src/components/FlashSaleCarousel';
import { colors, spacing, typography } from '@/src/design/tokens';
import { Ionicons } from '@expo/vector-icons';
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

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.categoryItem} 
      onPress={() => handleCategoryPress(item.id)}
    >
      <View style={styles.categoryIcon}>
        <Ionicons name={item.icon as any} size={24} color={colors.gold} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>{item.count} items</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
        <AppHeader title="Finest Known" showLivePrices={true} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section with Typing Animation */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <FinestKnownLogo size="large" showText={true} />
            <Text style={styles.websiteText}>Finestknown.com</Text>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Products</Text>
            <Text style={styles.sectionSubtitle}>Newest additions to our collection</Text>
          </View>
          <View style={styles.latestProductsGrid}>
            {categories.map((category) => {
              const metalIcons = {
                'Gold': 'medal',
                'Silver': 'medal-outline', 
                'Platinum': 'trophy',
                'Palladium': 'trophy-outline',
                'Copper': 'flame',
                'Rhodium': 'diamond'
              };
              const metalColors = {
                'Gold': '#FFD700',
                'Silver': '#C0C0C0',
                'Platinum': '#E5E4E2', 
                'Palladium': '#B4B4B4',
                'Copper': '#B87333',
                'Rhodium': '#A0A0A0'
              };
              
              return (
                <TouchableOpacity 
                  key={`latest-${category.id}`} 
                  style={styles.latestProductItem} 
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <View style={styles.latestProductImage}>
                    <Ionicons 
                      name={metalIcons[category.name as keyof typeof metalIcons] as any} 
                      size={24} 
                      color={metalColors[category.name as keyof typeof metalColors]} 
                    />
                  </View>
                  <View style={styles.latestProductInfo}>
                    <Text style={styles.latestProductName}>{category.name} Collection</Text>
                    <Text style={styles.latestProductPrice}>From $299</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  heroSection: {
    backgroundColor: colors.background,
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.l,
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
    marginTop: spacing.s,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  cursor: {
    color: colors.gold,
    fontSize: 48,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minWidth: 160,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minWidth: 160,
  },
  secondaryButtonText: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text,
    fontWeight: '700',
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  featuredList: {
    paddingRight: spacing.lg,
  },
  // Latest Products
  latestProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  latestProductItem: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.platinum,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  latestProductImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: colors.gold + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  latestProductInfo: {
    flex: 1,
  },
  latestProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  latestProductPrice: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: '500',
  },
  websiteText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gold,
    textAlign: 'center',
    marginTop: spacing.s,
    letterSpacing: 0.5,
  },
});