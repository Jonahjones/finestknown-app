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

export default function MorganSilverDollarsPage() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: articles, isLoading: articlesLoading, refetch: refetchArticles } = useQuery({
    queryKey: ['resource-articles', 'morgan-silver-dollars'],
    queryFn: () => listResourceArticles('morgan-silver-dollars'),
  });

  const { data: latestData, isLoading: latestLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['latest-products-morgan'],
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
      <AppHeader title="Morgan Silver Dollars" />
      
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
          title="MORGAN SILVER DOLLARS (1878-1921)"
          description="Discover America's most beloved silver dollar. Learn about key dates, mint marks, grading, and collecting strategies for Morgan Silver Dollars designed by George T. Morgan."
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
                description="Check back for articles about Morgan Silver Dollars."
                actionLabel="Browse Products"
              />
            )}
          </View>

          <ResourceSidebar>
            <ResourceSidebarSection title="ABOUT MORGAN DOLLARS">
              <ResourceSidebarText>
                The Morgan Silver Dollar, minted from 1878 to 1904 and again in 1921, remains one of 
                the most popular and widely collected U.S. coins. Designed by George T. Morgan, these 
                beautiful coins feature Lady Liberty on the obverse and a majestic eagle on the reverse.
              </ResourceSidebarText>
            </ResourceSidebarSection>

            <ResourceSidebarSection title="MINT MARKS">
              <View style={styles.list}>
                <Text style={styles.listItem}>• P - Philadelphia (No Mark)</Text>
                <Text style={styles.listItem}>• CC - Carson City</Text>
                <Text style={styles.listItem}>• O - New Orleans</Text>
                <Text style={styles.listItem}>• S - San Francisco</Text>
                <Text style={styles.listItem}>• D - Denver (1921 only)</Text>
              </View>
            </ResourceSidebarSection>

            <ResourceSidebarSection title="COLLECTING TIPS">
              <ResourceSidebarText>
                Start with common dates in circulated grades to learn about the series. Focus on eye appeal 
                and originality. Carson City (CC) mint marks are particularly popular. High-grade examples 
                (MS-64 and above) command significant premiums.
              </ResourceSidebarText>
            </ResourceSidebarSection>
          </ResourceSidebar>
        </View>

        {latestProducts.length > 0 && (
        <View style={styles.productsSection}>
            <ResourceProductRow
              products={latestProducts}
              title="FEATURED MORGAN DOLLARS & SILVER COINS"
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
