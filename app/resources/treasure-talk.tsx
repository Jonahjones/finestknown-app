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

export default function TreasureTalkPage() {
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['resource-articles', 'treasure-talk'],
    queryFn: () => listResourceArticles('treasure-talk'),
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
        <View style={styles.treasureIcon}>
          <Ionicons name="diamond" size={24} color={colors.gold} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.articleTitle}>{item.title}</Text>
          <Text style={styles.dateText}>{item.display_date || new Date(item.published_at).toLocaleDateString()}</Text>
        </View>
      </View>
      <Text style={styles.articleExcerpt}>{item.excerpt}</Text>
      <View style={styles.readMoreButton}>
        <Text style={styles.readMoreText}>Continue Reading</Text>
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
      <AppHeader title="Treasure Talk" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>CATEGORY ARCHIVES: TREASURE TALK</Text>
          <Text style={styles.pageDescription}>
            Fascinating stories of discovered treasures, shipwreck recoveries, metal detecting finds, 
            and legendary hoards. Explore the world of treasure hunting and numismatic discoveries.
          </Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.articlesSection}>
            {articlesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.gold} />
                <Text style={styles.loadingText}>Loading treasure stories...</Text>
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
                <Ionicons name="map-outline" size={64} color={colors.platinum} />
                <Text style={styles.emptyText}>No treasure stories available yet</Text>
                <Text style={styles.emptySubtext}>Check back for exciting discoveries!</Text>
              </View>
            )}
          </View>

          <View style={styles.sidebar}>
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>POPULAR TOPICS</Text>
              <View style={styles.topicList}>
                <TouchableOpacity style={styles.topicItem}>
                  <Ionicons name="boat" size={16} color={colors.gold} />
                  <Text style={styles.topicText}>Shipwreck Treasures</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.topicItem}>
                  <Ionicons name="search" size={16} color={colors.gold} />
                  <Text style={styles.topicText}>Metal Detecting</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.topicItem}>
                  <Ionicons name="skull" size={16} color={colors.gold} />
                  <Text style={styles.topicText}>Pirate Gold</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.topicItem}>
                  <Ionicons name="newspaper" size={16} color={colors.gold} />
                  <Text style={styles.topicText}>Recent Discoveries</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.topicItem}>
                  <Ionicons name="library" size={16} color={colors.gold} />
                  <Text style={styles.topicText}>Historical Hoards</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>ABOUT TREASURE TALK</Text>
              <Text style={styles.sidebarText}>
                Treasure Talk brings you captivating stories from the world of treasure hunting, 
                shipwreck recovery, and numismatic discoveries. From ancient coin hoards to modern 
                metal detecting finds, we explore the fascinating history behind these incredible discoveries.
              </Text>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>FEATURED FINDS</Text>
              <View style={styles.featuredList}>
                <Text style={styles.featuredItem}>💎 Spanish Gold Doubloons</Text>
                <Text style={styles.featuredItem}>⚓ 1715 Fleet Treasures</Text>
                <Text style={styles.featuredItem}>🏺 Roman Coin Hoard</Text>
                <Text style={styles.featuredItem}>👑 Medieval Treasure Trove</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>FEATURED TREASURE COINS & ARTIFACTS</Text>
          
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
  articleCard: {
    backgroundColor: colors.ivory,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  treasureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gold + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.navy,
    marginBottom: 4,
    lineHeight: 24,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
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
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.platinum,
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
  topicList: {
    gap: spacing.sm,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
  },
  topicText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  featuredList: {
    gap: spacing.sm,
  },
  featuredItem: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
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

