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

export default function VideosPage() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: articles, isLoading: articlesLoading, refetch: refetchArticles } = useQuery({
    queryKey: ['resource-articles', 'videos'],
    queryFn: () => listResourceArticles('videos'),
  });

  const { data: latestData, isLoading: latestLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['latest-products-videos'],
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
      <AppHeader title="Videos" />
      
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
          title="VIDEOS"
          description="Watch our collection of educational videos covering rare coins, precious metals, collecting tips, market analysis, and expert insights from the Finest Known team."
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
                icon="videocam-outline"
                title="No videos available yet"
                description="Check back soon for educational content and expert insights."
                actionLabel="Browse Products"
              />
            )}
          </View>

          <ResourceSidebar>
            <ResourceSidebarSection title="VIDEO CATEGORIES">
              <ResourceSidebarText>
                Our videos cover coin grading basics, market updates, authentication tips, investment 
                strategies, collector interviews, and behind-the-scenes looks at rare coin discoveries 
                and expert evaluations.
              </ResourceSidebarText>
            </ResourceSidebarSection>

            <ResourceSidebarSection title="SUBSCRIBE">
              <ResourceSidebarText>
                Subscribe to our channel to get notified when we post new educational videos about coins, 
                precious metals, and collecting. Stay up to date with the latest market insights and 
                expert analysis.
              </ResourceSidebarText>
            </ResourceSidebarSection>
          </ResourceSidebar>
        </View>

        {latestProducts.length > 0 && (
        <View style={styles.productsSection}>
            <ResourceProductRow
              products={latestProducts}
              title="FEATURED PRODUCTS"
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
