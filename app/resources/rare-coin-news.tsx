import { listArticles } from '@/src/api/articles';
import { AppHeader } from '@/src/components/AppHeader';
import { colors, spacing } from '@/src/design/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RareCoinNewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => listArticles({ limit: 20 }),
  });

  const articles = data?.articles || [];

  const handleArticlePress = (articleId: string) => {
    router.push(`/article/${articleId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Rare Coin News" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Rare Coin News" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Rare Coin News & Articles</Text>
          <Text style={styles.subtitle}>Expert insights, market analysis, and educational content</Text>
        </View>

        <View style={styles.newsList}>
          {articles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.newsItem}
              onPress={() => handleArticlePress(article.id)}
              activeOpacity={0.7}
            >
              {article.cover_url && (
                <Image 
                  source={{ uri: article.cover_url }} 
                  style={styles.newsImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.newsContent}>
                <View style={styles.newsHeader}>
                  <Text style={styles.newsCategory}>{article.category}</Text>
                  <Text style={styles.newsDate}>{formatDate(article.published_at)}</Text>
                </View>
                <Text style={styles.newsTitle} numberOfLines={2}>{article.title}</Text>
                {article.excerpt && (
                  <Text style={styles.newsExcerpt} numberOfLines={2}>{article.excerpt}</Text>
                )}
                <View style={styles.newsFooter}>
                  <Text style={styles.readMore}>{article.read_minutes} min read</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.gold} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {articles.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No articles available yet</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.ivory,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  newsList: {
    padding: spacing.lg,
  },
  newsItem: {
    backgroundColor: colors.ivory,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.platinum,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.platinum,
  },
  newsContent: {
    padding: spacing.md,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  newsCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gold,
    backgroundColor: colors.gold + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 10,
  },
  newsDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  newsExcerpt: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readMore: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});