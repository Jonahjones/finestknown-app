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

const GOLDBACK_ARTICLES = [
  {
    id: '1',
    title: 'The Revolutionary Goldback: A New Era of Sound Money',
    date: '28 Jul',
    excerpt: 'Goldbacks represent a revolutionary approach to currency that combines the stability of gold with the convenience of paper money...',
    content: `Goldbacks represent a revolutionary approach to currency that combines the stability of gold with the convenience of paper money. These innovative notes contain actual gold and are designed to circulate as local currency, promoting economic independence and sound money principles.

## The Birth of Goldbacks

The Goldback concept was born from the need for a practical, divisible form of gold that could be used in everyday transactions. Traditional gold coins, while valuable, are often too large for small purchases, and gold bars are impractical for daily use.

Goldbacks solve this problem by embedding precise amounts of gold into beautiful, durable notes that can be used just like regular currency, but with the intrinsic value of precious metals.

## How Goldbacks Work

Each Goldback contains a specific amount of 24-karat gold, ranging from 1/1000th to 1/20th of an ounce depending on denomination. The gold is embedded in a special polymer that makes the notes durable and resistant to wear.

The denominations available are:
- 1 Goldback = 1/1000 oz gold
- 5 Goldbacks = 1/200 oz gold  
- 10 Goldbacks = 1/100 oz gold
- 25 Goldbacks = 1/40 oz gold
- 50 Goldbacks = 1/20 oz gold

## Security Features

Goldbacks incorporate advanced security features to prevent counterfeiting:
- Holographic elements that are difficult to replicate
- Unique serial numbers for each note
- Special polymer construction that's nearly impossible to forge
- Watermark technology embedded in the gold layer

## Economic Benefits

Goldbacks offer several economic advantages:
- Hedge against inflation and currency devaluation
- Portable and divisible gold ownership
- Educational tool for teaching about sound money
- Promotes local economic independence
- Legal tender in participating jurisdictions

## The Future of Money

As concerns about fiat currency stability grow, Goldbacks represent a practical solution for those seeking to protect their wealth while maintaining the convenience of paper money. They bridge the gap between the old gold standard and modern digital currencies, offering a tangible, valuable alternative to traditional paper money.

The success of Goldbacks in participating states demonstrates the growing demand for sound money alternatives and the potential for precious metals to play a larger role in everyday commerce.`
  },
  {
    id: '2',
    title: 'Utah Goldbacks: Pioneering the Gold Standard Revolution',
    date: '25 Jul',
    excerpt: 'Utah was the first state to embrace Goldbacks as legal tender, setting a precedent for sound money innovation...',
    content: `Utah was the first state to embrace Goldbacks as legal tender, setting a precedent for sound money innovation that other states are beginning to follow. This groundbreaking decision has made Utah a leader in the movement toward precious metals-based currency.

## The Utah Precedent

In 2011, Utah became the first state to recognize gold and silver as legal tender, and Goldbacks were specifically designed to take advantage of this legislation. The state's forward-thinking approach has made it a testing ground for alternative currency systems.

Utah Goldbacks feature beautiful artwork celebrating the state's history and culture, making them not just functional currency but also collectible works of art.

## Economic Impact

The introduction of Goldbacks in Utah has had several positive economic effects:
- Increased awareness of sound money principles
- Boosted local precious metals industry
- Created new opportunities for small businesses
- Demonstrated the viability of alternative currencies

## Design and Artwork

Utah Goldbacks feature stunning artwork that celebrates the state's heritage:
- Pioneer themes and historical figures
- Natural landscapes and landmarks
- Cultural symbols and traditions
- Educational elements about Utah's history

## Adoption and Growth

Since their introduction, Utah Goldbacks have seen steady growth in adoption:
- Increasing number of participating merchants
- Growing acceptance in local communities
- Rising collector interest and value
- Expansion to other states following Utah's model

The success of Utah Goldbacks has inspired other states to consider similar legislation, potentially leading to a broader movement toward precious metals-based currency systems.`
  },
  {
    id: '3',
    title: 'Collecting Goldbacks: Investment and Numismatic Value',
    date: '22 Jul',
    excerpt: 'Goldbacks offer unique opportunities for both investors and collectors, combining precious metals value with artistic appeal...',
    content: `Goldbacks offer unique opportunities for both investors and collectors, combining precious metals value with artistic appeal. These innovative notes have created a new category in numismatics that appeals to both precious metals investors and currency collectors.

## Investment Potential

From an investment perspective, Goldbacks offer several advantages:
- Intrinsic gold value provides a floor price
- Potential for numismatic premium above gold content
- Diversification within precious metals portfolio
- Hedge against inflation and currency devaluation
- Liquidity through growing merchant acceptance

## Collecting Considerations

For collectors, Goldbacks present unique opportunities:
- Limited production runs create scarcity
- State-specific designs offer thematic collecting
- Serial number collecting and rarity
- First-year issues and special editions
- Educational value and historical significance

## Grading and Authentication

As Goldbacks gain acceptance in the collecting community, grading services are beginning to offer authentication and grading services. This development adds legitimacy to the market and helps establish fair pricing.

Key factors in Goldback grading include:
- Condition of the polymer substrate
- Clarity of the embedded gold
- Sharpness of printing and artwork
- Absence of folds, creases, or damage
- Serial number significance

## Market Development

The Goldback market is still in its early stages, presenting opportunities for early adopters:
- Growing collector base
- Increasing merchant acceptance
- Rising awareness and demand
- Potential for significant appreciation
- Educational and historical value

## Future Outlook

As the Goldback movement continues to grow, collectors and investors can expect:
- Increased recognition and acceptance
- Higher numismatic premiums
- More sophisticated grading systems
- Broader market participation
- Continued innovation in design and technology

Goldbacks represent a fascinating intersection of precious metals investing, currency collecting, and economic innovation, offering unique opportunities for those willing to explore this emerging market.`
  }
];

const FEATURED_GOLDBACKS = [
  {
    id: '1',
    title: '1 Utah Goldback Currency 1/1000 oz',
    price: 7.36,
    image: 'https://via.placeholder.com/100x60/FFD700/000000?text=1+UT',
    rating: 5,
    category: 'Goldbacks'
  },
  {
    id: '2',
    title: '1 New Hampshire Goldback Currency 1/1000 oz',
    price: 7.36,
    image: 'https://via.placeholder.com/100x60/FFD700/000000?text=1+NH',
    rating: 5,
    category: 'Goldbacks'
  },
  {
    id: '3',
    title: '1 Wyoming Goldback Currency 1/1000 oz',
    price: 7.36,
    image: 'https://via.placeholder.com/100x60/FFD700/000000?text=1+WY',
    rating: 5,
    category: 'Goldbacks'
  },
  {
    id: '4',
    title: '1 South Dakota Goldback Currency 1/1000 oz',
    price: 7.36,
    image: 'https://via.placeholder.com/100x60/FFD700/000000?text=1+SD',
    rating: 5,
    category: 'Goldbacks'
  },
  {
    id: '5',
    title: '2 Florida Goldback 1/500 oz',
    price: 14.78,
    image: 'https://via.placeholder.com/100x60/FFD700/000000?text=2+FL',
    rating: 5,
    category: 'Goldbacks'
  },
  {
    id: '6',
    title: '25 Florida Goldback 1/40 oz',
    price: 183.72,
    image: 'https://via.placeholder.com/100x60/FFD700/000000?text=25+FL',
    rating: 5,
    category: 'Goldbacks'
  }
];

export default function GoldbacksPage() {
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['resource-articles', 'goldbacks'],
    queryFn: () => listResourceArticles('goldbacks'),
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
      <AppHeader title="Goldbacks" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>CATEGORY ARCHIVES: GOLDBACKS</Text>
          <Text style={styles.pageDescription}>
            Discover the revolutionary world of Goldbacks - the world's first local currency made of gold. 
            Learn about this innovative approach to sound money and precious metals.
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
              <Text style={styles.sidebarTitle}>ABOUT GOLDBACKS</Text>
              <Text style={styles.sidebarText}>
                Goldbacks are a revolutionary form of currency that combines the beauty and value of gold 
                with the convenience of paper money. Each Goldback contains a precise amount of pure gold 
                and can be used as legal tender in participating areas.
              </Text>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>DENOMINATIONS</Text>
              <View style={styles.denominationList}>
                <Text style={styles.denominationItem}>1 Goldback = 1/1000 oz gold</Text>
                <Text style={styles.denominationItem}>5 Goldbacks = 1/200 oz gold</Text>
                <Text style={styles.denominationItem}>10 Goldbacks = 1/100 oz gold</Text>
                <Text style={styles.denominationItem}>25 Goldbacks = 1/40 oz gold</Text>
                <Text style={styles.denominationItem}>50 Goldbacks = 1/20 oz gold</Text>
              </View>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>PARTICIPATING STATES</Text>
              <View style={styles.stateList}>
                <Text style={styles.stateItem}>Utah</Text>
                <Text style={styles.stateItem}>Nevada</Text>
                <Text style={styles.stateItem}>New Hampshire</Text>
                <Text style={styles.stateItem}>Wyoming</Text>
                <Text style={styles.stateItem}>South Dakota</Text>
                <Text style={styles.stateItem}>Florida</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Featured Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>FEATURED GOLDBACK PRODUCTS</Text>
          
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
  denominationList: {
    marginTop: spacing.sm,
  },
  denominationItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
    paddingVertical: 2,
  },
  stateList: {
    marginTop: spacing.sm,
  },
  stateItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
    paddingVertical: 2,
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