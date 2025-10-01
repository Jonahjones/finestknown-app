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

const CAESAR_INFO = [
  { name: 'Julius Caesar', reign: '49-44 BC', coin: 'Aureus' },
  { name: 'Augustus', reign: '27 BC-14 AD', coin: 'Aureus' },
  { name: 'Tiberius', reign: '14-37 AD', coin: 'Aureus' },
  { name: 'Caligula', reign: '37-41 AD', coin: 'Aureus' },
  { name: 'Claudius', reign: '41-54 AD', coin: 'Aureus' },
  { name: 'Nero', reign: '54-68 AD', coin: 'Aureus' },
  { name: 'Vespasian', reign: '69-79 AD', coin: 'Aureus' },
  { name: 'Titus', reign: '79-81 AD', coin: 'Aureus' },
  { name: 'Domitian', reign: '81-96 AD', coin: 'Aureus' },
  { name: 'Trajan', reign: '98-117 AD', coin: 'Aureus' },
  { name: 'Hadrian', reign: '117-138 AD', coin: 'Aureus' },
  { name: 'Marcus Aurelius', reign: '161-180 AD', coin: 'Aureus' },
];

export default function CaesarGoldCoinsPage() {
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['resource-articles', 'caesar-gold-coins'],
    queryFn: () => listResourceArticles('caesar-gold-coins'),
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

  const renderCaesar = ({ item }: { item: typeof CAESAR_INFO[0] }) => (
    <View style={styles.caesarCard}>
      <View style={styles.caesarIcon}>
        <Ionicons name="person" size={24} color={colors.gold} />
      </View>
      <View style={styles.caesarInfo}>
        <Text style={styles.caesarName}>{item.name}</Text>
        <Text style={styles.caesarReign}>{item.reign}</Text>
        <Text style={styles.caesarCoin}>{item.coin}</Text>
      </View>
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
      <AppHeader title="12 Caesar's Gold Coins" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>THE 12 CAESARS GOLD COINS</Text>
          <Text style={styles.pageDescription}>
            Explore the legendary gold Aurei of the Twelve Caesars - from Julius Caesar to Marcus Aurelius. 
            These magnificent coins represent the pinnacle of ancient Roman numismatics and imperial power.
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
                    <Text style={styles.introTitle}>The Twelve Caesars Collection</Text>
                    <Text style={styles.introText}>
                      The Twelve Caesars represent the first dynasty of Roman emperors, beginning with 
                      Julius Caesar and extending through the Julio-Claudian and Flavian dynasties to 
                      the Five Good Emperors. Their gold Aurei are among the most sought-after coins 
                      in numismatics.
                    </Text>
                  </View>
                }
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="medal-outline" size={64} color={colors.platinum} />
                <Text style={styles.emptyText}>No articles available yet</Text>
              </View>
            )}
          </View>

          <View style={styles.sidebar}>
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>THE TWELVE CAESARS</Text>
              <FlatList
                data={CAESAR_INFO}
                renderItem={renderCaesar}
                keyExtractor={(item) => item.name}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>ABOUT THE AUREUS</Text>
              <Text style={styles.sidebarText}>
                The Aureus was the basic gold monetary unit of ancient Rome. Struck in nearly pure 
                gold (over 95%), these coins typically weighed about 7.3 grams and were valued at 
                25 silver denarii. Today, they are prized by collectors for their historical 
                significance and artistic beauty.
              </Text>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>COLLECTING GUIDE</Text>
              <Text style={styles.sidebarText}>
                Building a complete set of the Twelve Caesars is a lifetime achievement for most 
                collectors. Start with more common emperors like Hadrian or Trajan, then pursue 
                rarer examples. Authentication and provenance are crucial for ancient coins.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>FEATURED ANCIENT COINS</Text>
          
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
    backgroundColor: colors.gold + '10',
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
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
  caesarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
  },
  caesarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gold + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  caesarInfo: {
    flex: 1,
  },
  caesarName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
  },
  caesarReign: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  caesarCoin: {
    fontSize: 11,
    color: colors.gold,
    fontStyle: 'italic',
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

