import { listResourceArticles } from '@/src/api/articles';
import { listProducts } from '@/src/api/products';
import { AppHeader } from '@/src/components/AppHeader';
import {
  ResourceArticleCard,
  ResourceEmptyState,
  ResourcePageHeader,
  ResourceProductRow,
  ResourceSidebar,
  ResourceSidebarSection,
  ResourceSidebarText,
} from '@/src/components/resources';
import { colors, spacing } from '@/src/design/tokens';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CaesarGoldCoinsPage() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: articles, isLoading: articlesLoading, refetch: refetchArticles } = useQuery({
    queryKey: ['resource-articles', 'caesar-gold-coins'],
    queryFn: () => listResourceArticles('caesar-gold-coins'),
  });

  const { data: latestData, isLoading: latestLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['latest-products-caesar'],
    queryFn: () => listProducts({ pageSize: 6, sort: 'newest' }),
  });

  const latestProducts = (latestData?.items || []) as any;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchArticles(), refetchProducts()]);
    setRefreshing(false);
  }, [refetchArticles, refetchProducts]);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="12 Caesar's Gold Coins" />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand}
          />
        }
      >
        <ResourcePageHeader
          title="THE 12 CAESARS GOLD COINS"
          description="Explore the legendary gold Aurei of the Twelve Caesars - from Julius Caesar to Marcus Aurelius. These magnificent coins represent the pinnacle of ancient Roman numismatics and imperial power."
        />

        <View style={styles.mainContent}>
          <View style={styles.articlesSection}>
            {articlesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.gold} />
              </View>
            ) : articles && articles.length > 0 ? (
              articles.map((article) => (
                <ResourceArticleCard
                  key={article.id}
                  id={article.id}
                  slug={article.slug}
                  title={article.title}
                  excerpt={article.excerpt}
                  publishedAt={article.published_at}
                  resourceType={article.resource_type}
                  coverUrl={article.cover_url}
                  displayDate={article.display_date}
                />
              ))
            ) : (
              <ResourceEmptyState
                icon="medal-outline"
                title="No articles available yet"
                description="Check back for articles about the Twelve Caesars."
                actionLabel="Browse Products"
              />
            )}
          </View>

          <ResourceSidebar>
            <ResourceSidebarSection title="THE TWELVE CAESARS">
              <ResourceSidebarText>
                The Twelve Caesars represent the first dynasty of Roman emperors, beginning with Julius 
                Caesar and extending through the Julio-Claudian and Flavian dynasties to the Five Good 
                Emperors. Their gold Aurei are among the most sought-after coins in numismatics.
              </ResourceSidebarText>
            </ResourceSidebarSection>

            <ResourceSidebarSection title="ABOUT THE AUREUS">
              <ResourceSidebarText>
                The Aureus was the basic gold monetary unit of ancient Rome. Struck in nearly pure gold 
                (over 95%), these coins typically weighed about 7.3 grams and were valued at 25 silver 
                denarii. Today, they are prized by collectors for their historical significance and 
                artistic beauty.
              </ResourceSidebarText>
            </ResourceSidebarSection>

            <ResourceSidebarSection title="COLLECTING GUIDE">
              <ResourceSidebarText>
                Building a complete set of the Twelve Caesars is a lifetime achievement for most collectors. 
                Start with more common emperors like Hadrian or Trajan, then pursue rarer examples. 
                Authentication and provenance are crucial for ancient coins.
              </ResourceSidebarText>
            </ResourceSidebarSection>
          </ResourceSidebar>
        </View>

        {latestProducts.length > 0 && (
          <View style={styles.productsSection}>
            <ResourceProductRow
              products={latestProducts}
              title="FEATURED ANCIENT COINS"
              isLoading={latestLoading}
            />
          </View>
        )}
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
  mainContent: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  articlesSection: {
    flex: 2,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productsSection: {
    backgroundColor: colors.ivory,
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
});
