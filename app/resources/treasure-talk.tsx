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

export default function TreasureTalkPage() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: articles, isLoading: articlesLoading, refetch: refetchArticles } = useQuery({
    queryKey: ['resource-articles', 'treasure-talk'],
    queryFn: () => listResourceArticles('treasure-talk'),
  });

  const { data: latestData, isLoading: latestLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['latest-products-treasure'],
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
      <AppHeader title="Treasure Talk" />
      
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
          title="TREASURE TALK"
          description="Fascinating stories of discovered treasures, shipwreck recoveries, metal detecting finds, and legendary hoards. Explore the world of treasure hunting and numismatic discoveries."
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
                icon="map-outline"
                title="No treasure stories available yet"
                description="Check back for exciting treasure hunting stories and discoveries."
                actionLabel="Browse Products"
              />
            )}
          </View>

          <ResourceSidebar>
            <ResourceSidebarSection title="ABOUT TREASURE TALK">
              <ResourceSidebarText>
                Treasure Talk brings you captivating stories from the world of treasure hunting, shipwreck 
                recovery, and numismatic discoveries. From ancient coin hoards to modern metal detecting finds, 
                we explore the fascinating history behind these incredible discoveries.
              </ResourceSidebarText>
            </ResourceSidebarSection>

            <ResourceSidebarSection title="POPULAR TOPICS">
              <ResourceSidebarText>
                Discover stories about shipwreck treasures, metal detecting adventures, pirate gold legends, 
                recent archaeological discoveries, and historical coin hoards from around the world.
              </ResourceSidebarText>
            </ResourceSidebarSection>
          </ResourceSidebar>
        </View>

        {latestProducts.length > 0 && (
        <View style={styles.productsSection}>
            <ResourceProductRow
              products={latestProducts}
              title="FEATURED TREASURE COINS & ARTIFACTS"
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
