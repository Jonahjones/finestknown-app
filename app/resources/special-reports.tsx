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

export default function SpecialReportsPage() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: articles, isLoading: articlesLoading, refetch: refetchArticles } = useQuery({
    queryKey: ['resource-articles', 'special-reports'],
    queryFn: () => listResourceArticles('special-reports'),
  });

  const { data: latestData, isLoading: latestLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['latest-products-reports'],
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
      <AppHeader title="Special Reports" />
      
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
          title="SPECIAL REPORTS"
          description="In-depth analysis and special reports on rare coins, precious metals markets, investment trends, and numismatic research from Finest Known experts."
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
                icon="document-text-outline"
                title="No special reports available yet"
                description="Check back soon for expert analysis and market insights."
                actionLabel="Browse Products"
              />
            )}
          </View>

          <ResourceSidebar>
            <ResourceSidebarSection title="ABOUT SPECIAL REPORTS">
              <ResourceSidebarText>
                Our special reports provide comprehensive analysis and insights into the rare coin and precious 
                metals markets. Written by industry experts with decades of experience, these reports offer 
                valuable guidance for collectors and investors.
              </ResourceSidebarText>
            </ResourceSidebarSection>

            <ResourceSidebarSection title="REPORT CATEGORIES">
              <ResourceSidebarText>
                Our reports cover market analysis, investment guides, historical research, grading standards, 
                authentication techniques, and emerging trends in numismatics and precious metals collecting.
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
