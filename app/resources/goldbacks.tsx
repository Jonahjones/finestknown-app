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
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GoldbacksPage() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: articles, isLoading: articlesLoading, refetch: refetchArticles } = useQuery({
    queryKey: ['resource-articles', 'goldbacks'],
    queryFn: () => listResourceArticles('goldbacks'),
  });

  const { data: latestData, isLoading: latestLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['latest-products-goldbacks'],
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
      <AppHeader title="Goldbacks" />
      
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
          title="GOLDBACKS"
          description="Discover the revolutionary world of Goldbacks - the world's first local currency made of gold. Learn about this innovative approach to sound money and precious metals."
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
                icon="cash-outline"
                title="No articles available yet"
                description="Check back for articles about Goldbacks."
                actionLabel="Browse Products"
              />
            )}
          </View>

          <ResourceSidebar>
            <ResourceSidebarSection title="ABOUT GOLDBACKS">
              <ResourceSidebarText>
                Goldbacks are a revolutionary form of currency that combines the beauty and value of gold 
                with the convenience of paper money. Each Goldback contains a precise amount of pure gold 
                and can be used as legal tender in participating areas.
              </ResourceSidebarText>
            </ResourceSidebarSection>

            <ResourceSidebarSection title="DENOMINATIONS">
              <View style={styles.list}>
                <Text style={styles.listItem}>1 Goldback = 1/1000 oz gold</Text>
                <Text style={styles.listItem}>5 Goldbacks = 1/200 oz gold</Text>
                <Text style={styles.listItem}>10 Goldbacks = 1/100 oz gold</Text>
                <Text style={styles.listItem}>25 Goldbacks = 1/40 oz gold</Text>
                <Text style={styles.listItem}>50 Goldbacks = 1/20 oz gold</Text>
              </View>
            </ResourceSidebarSection>

            <ResourceSidebarSection title="PARTICIPATING STATES">
              <View style={styles.list}>
                <Text style={styles.listItem}>• Utah</Text>
                <Text style={styles.listItem}>• Nevada</Text>
                <Text style={styles.listItem}>• New Hampshire</Text>
                <Text style={styles.listItem}>• Wyoming</Text>
                <Text style={styles.listItem}>• South Dakota</Text>
                <Text style={styles.listItem}>• Florida</Text>
              </View>
            </ResourceSidebarSection>
          </ResourceSidebar>
        </View>

        {latestProducts.length > 0 && (
          <View style={styles.productsSection}>
            <ResourceProductRow
              products={latestProducts}
              title="FEATURED GOLDBACK PRODUCTS"
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
  list: {
    gap: spacing.xs,
  },
  listItem: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  productsSection: {
    backgroundColor: colors.ivory,
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
});
