import { getArticle } from '@/src/api/articles';
import { AppHeader } from '@/src/components/AppHeader';
import { colors, spacing, typography } from '@/src/design/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => getArticle(id as string),
    enabled: !!id,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Loading..." />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !article) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Article Not Found" />
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>Article Not Found</Text>
          <Text style={styles.errorText}>The article you're looking for doesn't exist.</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Research" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Article Image */}
        {article.cover_url && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: article.cover_url }} style={styles.articleImage} />
          </View>
        )}

        {/* Article Content */}
        <View style={styles.content}>
          {/* Category and Read Time */}
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{article.category}</Text>
            </View>
            <Text style={styles.readTime}>{article.read_minutes} min read</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Author Info */}
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{article.author}</Text>
            <Text style={styles.publishDate}>
              {formatDate(article.published_at)}
            </Text>
          </View>

          {/* Article Content */}
          <Text style={styles.articleContent}>{article.body_md}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 250,
    backgroundColor: colors.platinum,
  },
  articleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  categoryText: {
    color: colors.cardBackground,
    fontSize: typography.caption.size,
    fontWeight: '600',
  },
  readTime: {
    color: colors.textSecondary,
    fontSize: typography.caption.size,
  },
  title: {
    fontSize: typography.display.size,
    fontWeight: typography.display.weight,
    color: colors.textPrimary,
    lineHeight: typography.display.lineHeight,
    marginBottom: spacing.lg,
  },
  authorRow: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  authorName: {
    fontSize: typography.body.size,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  publishDate: {
    fontSize: typography.caption.size,
    color: colors.textSecondary,
  },
  articleContent: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight * 1.6,
    color: colors.textPrimary,
    textAlign: 'left',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.title.size,
    fontWeight: typography.title.weight,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.cardBackground,
    fontSize: typography.body.size,
    fontWeight: '600',
  },
});







