import { listResourceArticles } from '@/src/api/articles';
import { getBestSellingProducts, listProducts } from '@/src/api/products';
import { AppHeader } from '@/src/components/AppHeader';
import { colors, spacing } from '@/src/design/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const KEY_DATES = [
  { year: '1878-CC', rarity: 'Key Date', mintage: '2,212,000' },
  { year: '1879-CC', rarity: 'Key Date', mintage: '756,000' },
  { year: '1889-CC', rarity: 'Rare', mintage: '350,000' },
  { year: '1892-S', rarity: 'Key Date', mintage: '1,200,000' },
  { year: '1893-S', rarity: 'King of Morgans', mintage: '100,000' },
  { year: '1895', rarity: 'Proof Only', mintage: '880 (Proof)' },
  { year: '1903-O', rarity: 'Scarce', mintage: '4,450,000' },
  { year: '1904-S', rarity: 'Semi-Key', mintage: '2,304,000' },
];

export default function MorganSilverDollarsPage() {
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['resource-articles', 'morgan-silver-dollars'],
    queryFn: () => listResourceArticles('morgan-silver-dollars'),
  });

  const { data: latestData } = useQuery({
    queryKey: ['latest-products'],
    queryFn: () => listProducts({ pageSize: 4, sort: 'newest' }),
  });

  const { data: bestSellingData } = useQuery({
    queryKey: ['best-selling-products'],
    queryFn: () => getBestSellingProducts(4),
  });

  const { data: topRatedData } = useQuery({
    queryKey: ['top-rated-products'],
    queryFn: () => listProducts({ pageSize: 4, sort: 'rarity' }),
  });

  const latestProducts = latestData?.items || [];
  const bestSellingProducts = Array.isArray(bestSellingData) ? bestSellingData : [];
  const topRatedProducts = topRatedData?.items || [];

  const renderArticle = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.articleCard}
      onPress={() => router.push(`/learn/${item.slug}` as any)}
    >
      <View style={styles.articleHeader}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{item.display_date || new Date(item.published_at).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.articleTitle}>{item.title}</Text>
      </View>
      <Text style={styles.articleExcerpt}>{item.excerpt}</Text>
      <View style={styles.readMoreButton}>
        <Text style={styles.readMoreText}>Read More</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.gold} />
      </View>
    </TouchableOpacity>
  );

  const renderKeyDate = ({ item }: { item: typeof KEY_DATES[0] }) => (
    <View style={styles.keyDateCard}>
      <View style={styles.keyDateHeader}>
        <Text style={styles.keyDateYear}>{item.year}</Text>
        <View style={styles.rarityBadge}>
          <Text style={styles.rarityText}>{item.rarity}</Text>
        </View>
      </View>
      <Text style={styles.mintageText}>Mintage: {item.mintage}</Text>
    </View>
  );

  const renderProduct = ({ item }: { item: any }) => {
    const imageUri = item.photos && item.photos.length > 0 ? item.photos[0] : null;
    const price = item.price_cents ? (item.price_cents / 100).toFixed(2) : '0.00';
    
    return (
      <TouchableOpacity style={styles.productCard} onPress={() => router.push(`/product/${item.id}` as any)}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={32} color={colors.platinum} />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.productRating}>
            {[...Array(5)].map((_, i) => (
              <Ionicons key={i} name="star" size={12} color={colors.gold} />
            ))}
          </View>
          <Text style={styles.productPrice}>${price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Morgan Silver Dollars" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>MORGAN SILVER DOLLARS (1878-1921)</Text>
          <Text style={styles.pageDescription}>
            Discover America's most beloved silver dollar. Learn about key dates, mint marks, grading, 
            and collecting strategies for Morgan Silver Dollars designed by George T. Morgan.
          </Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.articlesSection}>
            {articlesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.gold} />
                <Text style={styles.loadingText}>Loading articles...</Text>
              </View>
            ) : articles && articles.length > 0 ? (
              <FlatList
                data={articles}
                renderItem={renderArticle}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                  <View style={styles.introSection}>
                    <Text style={styles.introTitle}>America's Favorite Silver Dollar</Text>
                    <Text style={styles.introText}>
                      The Morgan Silver Dollar, minted from 1878 to 1904 and again in 1921, remains 
                      one of the most popular and widely collected U.S. coins. Designed by George T. Morgan, 
                      these beautiful coins feature Lady Liberty on the obverse and a majestic eagle on the reverse. 
                      With numerous mint marks and key dates, Morgan Dollars offer collectors challenges at every level.
                    </Text>
                  </View>
                }
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="cash-outline" size={64} color={colors.platinum} />
                <Text style={styles.emptyText}>No articles available yet</Text>
              </View>
            )}
          </View>

          <View style={styles.sidebar}>
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>KEY DATES & RARITIES</Text>
              <FlatList
                data={KEY_DATES}
                renderItem={renderKeyDate}
                keyExtractor={(item) => item.year}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>MINT MARKS</Text>
              <View style={styles.mintMarkList}>
                <View style={styles.mintMarkItem}>
                  <View style={styles.mintMarkBadge}>
                    <Text style={styles.mintMarkCode}>P</Text>
                  </View>
                  <Text style={styles.mintMarkName}>Philadelphia (No Mark)</Text>
                </View>
                <View style={styles.mintMarkItem}>
                  <View style={styles.mintMarkBadge}>
                    <Text style={styles.mintMarkCode}>CC</Text>
                  </View>
                  <Text style={styles.mintMarkName}>Carson City</Text>
                </View>
                <View style={styles.mintMarkItem}>
                  <View style={styles.mintMarkBadge}>
                    <Text style={styles.mintMarkCode}>O</Text>
                  </View>
                  <Text style={styles.mintMarkName}>New Orleans</Text>
                </View>
                <View style={styles.mintMarkItem}>
                  <View style={styles.mintMarkBadge}>
                    <Text style={styles.mintMarkCode}>S</Text>
                  </View>
                  <Text style={styles.mintMarkName}>San Francisco</Text>
                </View>
                <View style={styles.mintMarkItem}>
                  <View style={styles.mintMarkBadge}>
                    <Text style={styles.mintMarkCode}>D</Text>
                  </View>
                  <Text style={styles.mintMarkName}>Denver (1921 only)</Text>
                </View>
              </View>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>COLLECTING TIPS</Text>
              <Text style={styles.sidebarText}>
                Start with common dates in circulated grades to learn about the series. Focus on 
                eye appeal and originality. Carson City (CC) mint marks are particularly popular. 
                High-grade examples (MS-64 and above) command significant premiums. Always buy from 
                reputable dealers and consider third-party grading for valuable coins.
              </Text>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>GRADING GUIDE</Text>
              <View style={styles.gradeList}>
                <Text style={styles.gradeItem}>• MS-65+: Premium quality</Text>
                <Text style={styles.gradeItem}>• MS-63-64: Choice uncirculated</Text>
                <Text style={styles.gradeItem}>• MS-60-62: Uncirculated</Text>
                <Text style={styles.gradeItem}>• AU: About uncirculated</Text>
                <Text style={styles.gradeItem}>• XF-VF: Circulated grades</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>FEATURED MORGAN DOLLARS & SILVER COINS</Text>
          
          <View style={styles.productRow}>
            <Text style={styles.rowTitle}>LATEST</Text>
            <FlatList
              data={latestProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productRowContent}
            />
          </View>

          <View style={styles.productRow}>
            <Text style={styles.rowTitle}>BEST SELLING</Text>
            <FlatList
              data={bestSellingProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => `best-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productRowContent}
            />
          </View>

          <View style={styles.productRow}>
            <Text style={styles.rowTitle}>TOP RATED</Text>
            <FlatList
              data={topRatedProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => `top-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productRowContent}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  pageHeader: {
    backgroundColor: colors.ivory,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  pageDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  mainContent: {
    flexDirection: 'row',
    padding: spacing.lg,
  },
  articlesSection: {
    flex: 2,
    marginRight: spacing.lg,
  },
  introSection: {
    backgroundColor: colors.platinum + '30',
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.navy,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  introText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  articleCard: {
    backgroundColor: colors.ivory,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  articleHeader: {
    marginBottom: spacing.md,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ivory,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.navy,
    lineHeight: 24,
  },
  articleExcerpt: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gold,
  },
  sidebar: {
    flex: 1,
  },
  sidebarSection: {
    backgroundColor: colors.ivory,
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
  },
  sidebarText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  keyDateCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  keyDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  keyDateYear: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
  },
  rarityBadge: {
    backgroundColor: colors.gold + '30',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 0.5,
  },
  mintageText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  mintMarkList: {
    gap: spacing.sm,
  },
  mintMarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mintMarkBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mintMarkCode: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gold,
  },
  mintMarkName: {
    fontSize: 14,
    color: colors.text,
  },
  gradeList: {
    gap: spacing.xs,
  },
  gradeItem: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  productsSection: {
    backgroundColor: colors.ivory,
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
  productsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  productRow: {
    marginBottom: spacing.xl,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
    paddingBottom: spacing.sm,
  },
  productRowContent: {
    paddingHorizontal: spacing.lg,
  },
  productCard: {
    width: 280,
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  placeholderImage: {
    backgroundColor: colors.platinum + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  productRating: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.md,
  },
});

