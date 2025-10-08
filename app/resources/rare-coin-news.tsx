import { listArticles } from '@/src/api/articles';
import { AppHeader } from '@/src/components/AppHeader';
import {
  ResourceArticleCard,
  ResourceEmptyState,
  ResourcePageHeader,
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

export default function RareCoinNewsPage() {
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['articles'],
    queryFn: () => listArticles({ limit: 20 }),
  });

  const articles = data?.articles || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Rare Coin News" />
      
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
          title="Rare Coin News & Articles"
          description="Expert insights, market analysis, and educational content from the world of numismatics."
        />

        <View style={styles.articlesList}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.gold} />
            </View>
          ) : articles.length > 0 ? (
            articles.map((article) => (
              <ResourceArticleCard
                key={article.id}
                id={article.id}
                slug={article.slug}
                title={article.title}
                excerpt={article.excerpt}
                publishedAt={article.published_at}
                resourceType={article.category}
                coverUrl={article.cover_url}
              />
            ))
          ) : (
            <ResourceEmptyState
              icon="newspaper-outline"
              title="No articles available yet"
              description="Check back soon for the latest coin news and market updates."
              actionLabel="Browse Products"
            />
          )}
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
  articlesList: {
    padding: spacing.lg,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});