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

export default function SpecialReportsPage() {
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['resource-articles', 'special-reports'],
    queryFn: () => listResourceArticles('special-reports'),
  });

  // Fetch latest products (newest by created_at)
  const { data: latestData } = useQuery({
    queryKey: ['latest-products'],
    queryFn: () => listProducts({ pageSize: 4, sort: 'newest' }),
  });

  // Fetch best selling products (based on actual sales)
  const { data: bestSellingData } = useQuery({
    queryKey: ['best-selling-products'],
    queryFn: () => getBestSellingProducts(4),
  });

  // Fetch top rated products (using rarity_score)
  const { data: topRatedData } = useQuery({
    queryKey: ['top-rated-products'],
    queryFn: () => listProducts({ pageSize: 4, sort: 'rarity' }),
  });

  const latestProducts = latestData?.items || [];
  const bestSellingProducts = Array.isArray(bestSellingData) ? bestSellingData : [];
  const topRatedProducts = topRatedData?.items || [];

  const renderArticle = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.reportCard}
      onPress={() => router.push(`/learn/${item.slug}` as any)}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportBadge}>
          <Ionicons name="document-text" size={20} color={colors.gold} />
          <Text style={styles.reportBadgeText}>SPECIAL REPORT</Text>
        </View>
        <Text style={styles.dateText}>{item.display_date || new Date(item.published_at).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.reportTitle}>{item.title}</Text>
      <Text style={styles.reportExcerpt} numberOfLines={3}>{item.excerpt}</Text>
      <View style={styles.readButton}>
        <Text style={styles.readText}>Read Full Report</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.gold} />
      </View>
    </TouchableOpacity>
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
      <AppHeader title="Special Reports" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>CATEGORY ARCHIVES: SPECIAL REPORTS</Text>
          <Text style={styles.pageDescription}>
            In-depth analysis and special reports on rare coins, precious metals markets, 
            investment trends, and numismatic research from Finest Known experts.
          </Text>
        </View>

        <View style={styles.mainContent}>
          {/* Reports Section */}
          <View style={styles.reportsSection}>
            {articlesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.gold} />
                <Text style={styles.loadingText}>Loading reports...</Text>
              </View>
            ) : articles && articles.length > 0 ? (
              <FlatList
                data={articles}
                renderItem={renderArticle}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={64} color={colors.platinum} />
                <Text style={styles.emptyText}>No special reports available yet</Text>
                <Text style={styles.emptySubtext}>Check back soon for expert analysis!</Text>
              </View>
            )}
          </View>

          {/* Sidebar */}
          <View style={styles.sidebar}>
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>REPORT CATEGORIES</Text>
              <View style={styles.categoryList}>
                <TouchableOpacity style={styles.categoryItem}>
                  <Text style={styles.categoryText}>Market Analysis</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryItem}>
                  <Text style={styles.categoryText}>Investment Guides</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryItem}>
                  <Text style={styles.categoryText}>Historical Research</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryItem}>
                  <Text style={styles.categoryText}>Grading Standards</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryItem}>
                  <Text style={styles.categoryText}>Authentication</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>ABOUT SPECIAL REPORTS</Text>
              <Text style={styles.sidebarText}>
                Our special reports provide comprehensive analysis and insights into the rare coin 
                and precious metals markets. Written by industry experts with decades of experience, 
                these reports offer valuable guidance for collectors and investors.
              </Text>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>GET NOTIFICATIONS</Text>
              <Text style={styles.sidebarText}>
                Subscribe to receive email notifications when we publish new special reports.
              </Text>
              <TouchableOpacity style={styles.subscribeButton}>
                <Ionicons name="mail" size={20} color={colors.background} />
                <Text style={styles.subscribeButtonText}>Subscribe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Featured Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>FEATURED PRODUCTS</Text>
          
          {/* Latest Row */}
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

          {/* Best Selling Row */}
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

          {/* Top Rated Row */}
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
  reportsSection: {
    flex: 2,
    marginRight: spacing.lg,
  },
  reportCard: {
    backgroundColor: colors.ivory,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.platinum,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  reportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.gold + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reportBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
    lineHeight: 26,
  },
  reportExcerpt: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.platinum,
  },
  readText: {
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: spacing.md,
  },
  categoryList: {
    gap: spacing.xs,
  },
  categoryItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  subscribeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
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
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

