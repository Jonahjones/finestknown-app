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

const DOUBLE_EAGLE_ARTICLES = [
  {
    id: '1',
    title: 'Why Proof Type I Double Eagles Are Exceptionally Rare',
    date: '24 Jul',
    excerpt: 'Proof Liberty Head double eagles occupy a unique corner of numismatics defined by exceptional rarity and meticulous craftsmanship...',
    content: `Proof Liberty Head double eagles occupy a unique corner of numismatics defined by exceptional rarity and meticulous craftsmanship. Struck with extra care on polished planchets using multiple blows from specially prepared dies, these coins were never intended for everyday use. Instead, they were created for collectors, diplomats, and dignitaries, making their survival even more remarkable.

## Understanding the Rarity of Proof Type I Double Eagles

The first Proof double eagle was the famed 1849 specimen, now housed in the Smithsonian. From that point through the end of the Type I series in 1865, Proofs were struck only sporadically, and in extremely low numbers, typically fewer than 80 per year. For some dates, fewer than a dozen examples are known to exist today.

This rarity was no accident. Coin collecting was still in its infancy, and few Americans could justify tying up $20 in a single coin, a considerable amount at the time. Many of these pieces were later melted or spent, especially during economic downturns such as the Great Depression, when their numismatic value was not yet widely recognized.

## Surviving Proof Type I Double Eagles: Grades, Craftsmanship, and Value

Proof Type I double eagles that exist today tend to be well preserved, often residing in long-term collections. Most surviving examples grade between Proof-63 and Proof-64, though those at Proof-65 or higher are exceedingly rare — possibly only three or four known across all dates.

These coins are admired not just for their condition but for the level of craftsmanship they represent. Their mirrored fields and sharp devices stand apart from circulation strikes, and their extreme rarity has made them cornerstones of elite collections.

## Proof Double Eagles Production by the Numbers

In total, fewer than 350 Proof Type I double eagles were struck, and only an estimated 75 survive today. Select key dates include:

- 1854-S: Just one known example
- 1856-O: Possibly unique
- 1863 & 1864: Each with a dozen or so survivors

Explore the full list of known proof Type I Liberty Head double eagle dates and surviving figures on FinestKnown.com, and discover an elite category of U.S. gold coinage where artistry, rarity, and history converge.`
  },
  {
    id: '2',
    title: 'The 1933 Double Eagle: America\'s Most Valuable Coin',
    date: '21 Jul',
    excerpt: 'The 1933 Double Eagle represents one of the most fascinating chapters in American numismatic history...',
    content: `The 1933 Double Eagle represents one of the most fascinating chapters in American numismatic history. This $20 gold coin, designed by Augustus Saint-Gaudens, was never officially released for circulation due to President Franklin D. Roosevelt's 1933 executive order that prohibited the private ownership of gold.

## The Historical Context

In 1933, as the Great Depression gripped the nation, President Roosevelt issued Executive Order 6102, which required all gold coins, gold bullion, and gold certificates to be turned in to the Federal Reserve. This order effectively made the 1933 Double Eagles illegal to own, as they were never officially released into circulation.

Despite this, a small number of 1933 Double Eagles were illegally removed from the U.S. Mint and entered private hands. These coins became the subject of one of the most famous legal battles in numismatic history.

## The Legal Battle and Resolution

For decades, the U.S. government considered all 1933 Double Eagles to be stolen property and pursued their recovery aggressively. The most famous example, once owned by King Farouk of Egypt, was eventually recovered and became the only legal 1933 Double Eagle.

In 2002, this coin was sold at auction for $7.59 million, making it the most valuable coin ever sold at the time. Today, it remains one of the most valuable coins in the world, with an estimated value exceeding $18 million.

## Rarity and Collectibility

Only one 1933 Double Eagle is legally owned by a private individual, making it the ultimate rarity in American numismatics. The coin's combination of historical significance, legal intrigue, and extreme rarity has made it a legend among collectors and investors alike.

The 1933 Double Eagle represents not just a coin, but a piece of American history that bridges the gap between the Great Depression and modern numismatic collecting.`
  },
  {
    id: '3',
    title: 'Saint-Gaudens Double Eagles: The Art of American Coinage',
    date: '17 Jul',
    excerpt: 'The Saint-Gaudens Double Eagle represents the pinnacle of American coin design...',
    content: `The Saint-Gaudens Double Eagle represents the pinnacle of American coin design, created by one of America's greatest sculptors and representing the artistic and cultural aspirations of the early 20th century.

## The Designer: Augustus Saint-Gaudens

Augustus Saint-Gaudens (1848-1907) was one of America's most celebrated sculptors, known for his monumental works and artistic vision. When President Theodore Roosevelt approached him to redesign American coinage, Saint-Gaudens brought his artistic genius to the task.

The result was a series of coins that elevated American numismatics to new heights, with the $20 Double Eagle standing as his masterpiece.

## Design Elements and Symbolism

The obverse features Lady Liberty striding forward, holding an olive branch and a torch, symbolizing peace and enlightenment. The reverse depicts a majestic eagle in flight, representing American strength and freedom.

Saint-Gaudens' design was revolutionary for its time, featuring high relief that created dramatic shadows and depth. The coin's artistic merit was so exceptional that it influenced coin design for decades to come.

## Production Challenges and Modifications

The original high-relief design proved too difficult for mass production, requiring multiple strikes and causing excessive die wear. The Mint was forced to reduce the relief, creating the more common "low relief" version that circulated from 1908-1933.

Despite these modifications, the Saint-Gaudens Double Eagle remains one of the most beautiful coins ever produced by the U.S. Mint, combining artistic excellence with historical significance.

## Collecting Saint-Gaudens Double Eagles

Today, Saint-Gaudens Double Eagles are highly sought after by collectors and investors. The series offers something for every budget, from common dates in circulated condition to rare high-relief examples worth millions.

The coin's combination of artistic beauty, historical significance, and gold content makes it a cornerstone of any serious collection.`
  }
];

const FEATURED_PRODUCTS = [
  {
    id: '1',
    title: '1923 $20 GOLD ST. GAUDENS PCGS MS63',
    price: 4161.41,
    image: 'https://via.placeholder.com/100x100/FFD700/000000?text=1923+$20',
    rating: 5,
    category: 'Double Eagles'
  },
  {
    id: '2',
    title: '1907 $20 GOLD ST. GAUDENS HIGH RELIEF PCGS MS64',
    price: 12500.00,
    image: 'https://via.placeholder.com/100x100/FFD700/000000?text=1907+HR',
    rating: 5,
    category: 'Double Eagles'
  },
  {
    id: '3',
    title: '1927-D $20 GOLD ST. GAUDENS PCGS MS65',
    price: 25000.00,
    image: 'https://via.placeholder.com/100x100/FFD700/000000?text=1927-D',
    rating: 5,
    category: 'Double Eagles'
  },
  {
    id: '4',
    title: '1933 $20 GOLD ST. GAUDENS PCGS MS65',
    price: 18000000.00,
    image: 'https://via.placeholder.com/100x100/FFD700/000000?text=1933',
    rating: 5,
    category: 'Double Eagles'
  }
];

export default function DoubleEaglesPage() {
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['resource-articles', 'double-eagles'],
    queryFn: () => listResourceArticles('double-eagles'),
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
      <AppHeader title="Double Eagles" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>CATEGORY ARCHIVES: DOUBLE EAGLE COINS</Text>
          <Text style={styles.pageDescription}>
            Finest Known presents an exceptional collection of double eagle coins, highlighting the artistry, 
            history, and rarity of these remarkable American gold pieces.
          </Text>
        </View>

        <View style={styles.mainContent}>
          {/* Articles Section */}
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
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No articles available yet</Text>
              </View>
            )}
          </View>

          {/* Sidebar */}
          <View style={styles.sidebar}>
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>ABOUT</Text>
              <Text style={styles.sidebarText}>
                Finest Known offers exquisite rare coins, ancient coinage, shipwreck treasure, 
                currency, documents, art and artifacts of historical significance.
              </Text>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>CATEGORIES</Text>
              <View style={styles.categoryList}>
                <Text style={styles.categoryItem}>Double Eagle Coins (15)</Text>
                <Text style={styles.categoryItem}>News (134)</Text>
                <Text style={styles.categoryItem}>Rare Coin Articles (109)</Text>
                <Text style={styles.categoryItem}>Reference Library (32)</Text>
                <Text style={styles.categoryItem}>Treasure Talk with Bob Evans (14)</Text>
                <Text style={styles.categoryItem}>Videos (31)</Text>
              </View>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>LATEST POSTS</Text>
              <View style={styles.latestPosts}>
                <View style={styles.postItem}>
                  <View style={styles.postDate}>
                    <Text style={styles.postDateText}>30 Sep</Text>
                  </View>
                  <Text style={styles.postId}>58608</Text>
                </View>
                <View style={styles.postItem}>
                  <View style={styles.postDate}>
                    <Text style={styles.postDateText}>24 Sep</Text>
                  </View>
                  <Text style={styles.postId}>58542</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Featured Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>FEATURED DOUBLE EAGLE PRODUCTS</Text>
          <View style={styles.productsGrid}>
            <View style={styles.productColumn}>
              <Text style={styles.columnTitle}>LATEST</Text>
              <FlatList
                data={latestProducts.slice(0, 4)}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
            <View style={styles.productColumn}>
              <Text style={styles.columnTitle}>BEST SELLING</Text>
              <FlatList
                data={bestSellingProducts.slice(0, 4)}
                renderItem={renderProduct}
                keyExtractor={(item) => `best-${item.id}`}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
            <View style={styles.productColumn}>
              <Text style={styles.columnTitle}>TOP RATED</Text>
              <FlatList
                data={topRatedProducts.slice(0, 3)}
                renderItem={renderProduct}
                keyExtractor={(item) => `top-${item.id}`}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.ivory,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  pageDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  mainContent: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  articlesSection: {
    flex: 2,
    marginRight: spacing.lg,
  },
  articleCard: {
    backgroundColor: colors.ivory,
    borderRadius: 8,
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
  dateBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ivory,
  },
  articleTitle: {
    flex: 1,
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
  categoryList: {
    marginTop: spacing.sm,
  },
  categoryItem: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    paddingVertical: 2,
  },
  latestPosts: {
    marginTop: spacing.sm,
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  postDate: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  postDateText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.ivory,
  },
  postId: {
    fontSize: 12,
    color: colors.textSecondary,
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
  },
  productsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productColumn: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
    paddingBottom: spacing.sm,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  productImage: {
    width: 60,
    height: 60,
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
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 16,
  },
  productRating: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
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
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});