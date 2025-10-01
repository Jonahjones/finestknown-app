import { getArticle } from '@/src/api/articles';
import { Badge, Card, Skeleton } from '@/src/components/ui';
import { colors, radius, shadows, spacing, typography } from '@/src/design/tokens';
import { analytics } from '@/src/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

const ArticleDetailSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      <View style={styles.heroSection}>
        <Skeleton width="100%" height={400} />
        <View style={[styles.floatingHeader, { paddingTop: insets.top + spacing.m }]}>
          <Skeleton width={44} height={44} style={{ borderRadius: 22 }} />
          <Skeleton width={44} height={44} style={{ borderRadius: 22 }} />
        </View>
      </View>
    
    <View style={styles.articleContent}>
      <Card elevation="e1" style={styles.metaCard}>
        <View style={styles.authorSection}>
          <Skeleton width={48} height={48} style={{ borderRadius: 24 }} />
          <View style={styles.authorInfo}>
            <Skeleton width={120} height={18} style={{ marginBottom: 4 }} />
            <Skeleton width={200} height={14} />
          </View>
        </View>
      </Card>
      
      <Card elevation="e1" style={styles.excerptCard}>
        <Skeleton width="100%" height={20} style={{ marginBottom: spacing.s }} />
        <Skeleton width="90%" height={20} style={{ marginBottom: spacing.s }} />
        <Skeleton width="95%" height={20} />
      </Card>
      
      <Card elevation="e1" style={styles.contentCard}>
        <View style={styles.bodySkeleton}>
          {[...Array(8)].map((_, i) => (
            <Skeleton 
              key={i} 
              width={i % 3 === 0 ? "85%" : "100%"} 
              height={16} 
              style={{ marginBottom: spacing.s }} 
            />
          ))}
        </View>
      </Card>
    </View>
    </View>
  );
};

export default function ArticleDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (slug) {
      analytics.track('article_detail', { 
        slug,
        slug_type: 'title_based'
      });
    }
  }, [slug]);

  const { 
    data: article, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticle(slug!),
    enabled: !!slug,
  });

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (!article) return;
    
    try {
      await Share.share({
        message: `${article.title}\n\n${article.excerpt || ''}\n\nRead more research in the Finest Known app.`,
        title: article.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (isLoading) {
    return <ArticleDetailSkeleton />;
  }

  if (error || !article) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.floatingHeader, { paddingTop: insets.top + spacing.m }]}>
            <TouchableOpacity 
              style={styles.floatingBackButton} 
              onPress={handleBack}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.ivory} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.errorContainer}>
            <Ionicons name="document-text-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.errorTitle}>Research not found</Text>
            <Text style={styles.errorMessage}>
              The research article you\'re looking for doesn\'t exist or has been removed.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Enhanced markdown styles using design tokens
  const markdownStyles = {
    body: {
      fontSize: typography.body.size,
      lineHeight: typography.body.lineHeight * 1.3,
      color: colors.text,
      fontFamily: 'System',
    },
    heading1: {
      fontSize: typography.title.size,
      lineHeight: typography.title.lineHeight,
      fontWeight: typography.title.weight,
      color: colors.text,
      marginTop: spacing.xl,
      marginBottom: spacing.l,
    },
    heading2: {
      fontSize: typography.heading.size,
      lineHeight: typography.heading.lineHeight,
      fontWeight: typography.heading.weight,
      color: colors.text,
      marginTop: spacing.l,
      marginBottom: spacing.m,
    },
    heading3: {
      fontSize: typography.body.size * 1.1,
      lineHeight: typography.body.lineHeight,
      fontWeight: typography.weights.semibold,
      color: colors.text,
      marginTop: spacing.l,
      marginBottom: spacing.m,
    },
    paragraph: {
      fontSize: typography.body.size,
      lineHeight: typography.body.lineHeight * 1.3,
      color: colors.text,
      marginBottom: spacing.m,
    },
    strong: {
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    em: {
      fontStyle: 'italic',
      color: colors.textSecondary,
    },
    list_item: {
      fontSize: typography.body.size,
      lineHeight: typography.body.lineHeight * 1.3,
      color: colors.text,
      marginBottom: spacing.s,
    },
    bullet_list: {
      marginBottom: spacing.m,
    },
    ordered_list: {
      marginBottom: spacing.m,
    },
    blockquote: {
      backgroundColor: colors.platinum,
      borderLeftWidth: 4,
      borderLeftColor: colors.gold,
      paddingHorizontal: spacing.l,
      paddingVertical: spacing.m,
      marginVertical: spacing.m,
      borderRadius: radius.sm,
    },
    code_inline: {
      backgroundColor: colors.platinum,
      paddingHorizontal: spacing.s,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      fontSize: typography.caption.size,
      fontFamily: 'Courier',
      color: colors.navy,
    },
    code_block: {
      backgroundColor: colors.platinum,
      padding: spacing.l,
      borderRadius: radius.md,
      marginVertical: spacing.m,
      fontSize: typography.caption.size,
      fontFamily: 'Courier',
      color: colors.navy,
    },
    link: {
      color: colors.navy,
      textDecorationLine: 'underline',
    },
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Section with Cover Image */}
        <View style={styles.heroSection}>
          {article.cover_url && (
            <View style={styles.coverImageContainer}>
              <Image 
                source={{ uri: article.cover_url }} 
                style={styles.coverImage}
                defaultSource={{ uri: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800' }}
              />
              {/* Gradient overlay for text readability */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                style={styles.imageGradient}
              />
            </View>
          )}

          {/* Floating Header */}
          <View style={[styles.floatingHeader, { paddingTop: insets.top + spacing.m }]}>
            <TouchableOpacity 
              style={styles.floatingBackButton} 
              onPress={handleBack}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.ivory} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.floatingShareButton} 
              onPress={handleShare}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="share-outline" size={24} color={colors.ivory} />
            </TouchableOpacity>
          </View>

          {/* Hero Content Overlay */}
          {article.cover_url && (
            <View style={styles.heroContent}>
              <Badge variant="filled" style={styles.heroBadge}>
                {article.category}
              </Badge>
              <Text style={styles.heroTitle} numberOfLines={3}>
                {article.title}
              </Text>
            </View>
          )}
        </View>
        
        {/* Article Content */}
        <View style={styles.articleContent}>
          {/* Title for articles without cover image */}
          {!article.cover_url && (
            <>
              <Badge variant="filled" style={styles.categoryBadge}>
                {article.category}
              </Badge>
              <Text style={styles.title}>{article.title}</Text>
            </>
          )}
          
          {/* Author and Meta Card */}
          <Card elevation="e1" style={styles.metaCard}>
            <View style={styles.authorSection}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorInitial}>
                  {article.author?.charAt(0).toUpperCase() || 'A'}
                </Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>By {article.author}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    {new Date(article.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.metaText}>{article.read_minutes || 5} min read</Text>
                </View>
              </View>
            </View>
          </Card>
          
          {/* Excerpt */}
          {article.excerpt && (
            <Card elevation="e1" style={styles.excerptCard}>
              <View style={styles.excerptIcon}>
                <Ionicons name="chatbox-outline" size={24} color={colors.gold} />
              </View>
              <Text style={styles.excerpt}>{article.excerpt}</Text>
            </Card>
          )}
          
          {/* Article Body */}
          <Card elevation="e1" style={styles.contentCard}>
            <Markdown style={markdownStyles}>
              {typeof article.body_md === 'string' ? article.body_md : String(article.body_md || '')}
            </Markdown>
          </Card>

          {/* Article Footer */}
          <Card elevation="e1" style={styles.footerCard}>
            <View style={styles.footerContent}>
              <View style={styles.footerIcon}>
                <Ionicons name="library-outline" size={32} color={colors.gold} />
              </View>
              <Text style={styles.footerTitle}>More Research</Text>
              <Text style={styles.footerText}>
                Explore our comprehensive collection of precious metals research and market insights.
              </Text>
              <TouchableOpacity 
                style={styles.footerButton}
                onPress={() => router.push('/(tabs)/learn')}
              >
                <Text style={styles.footerButtonText}>Browse All Articles</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.navy} />
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
      
      <SafeAreaView edges={['top']} style={styles.safeAreaTop} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  safeArea: {
    flex: 1,
  },
  safeAreaTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    position: 'relative',
    minHeight: 320,
  },
  coverImageContainer: {
    width: screenWidth,
    height: 400,
    backgroundColor: colors.platinum,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  
  // Floating Header
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.m,
    zIndex: 20,
  },
  floatingBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.e2,
  },
  floatingShareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.e2,
  },

  // Hero Content
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.l,
    zIndex: 15,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    marginBottom: spacing.m,
    backgroundColor: colors.gold,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: typography.weights.bold,
    color: colors.ivory,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Article Content
  articleContent: {
    padding: spacing.l,
    paddingTop: spacing.xl,
    gap: spacing.l,
  },

  // Title for non-hero articles
  categoryBadge: {
    alignSelf: 'flex-start',
    marginBottom: spacing.m,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.l,
  },

  // Author & Meta Card
  metaCard: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.l,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  authorInitial: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.ivory,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    color: colors.textSecondary,
  },
  metaDivider: {
    fontSize: typography.caption.size,
    color: colors.textTertiary,
    marginHorizontal: spacing.s,
  },

  // Excerpt Card
  excerptCard: {
    backgroundColor: colors.platinum,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
    padding: spacing.l,
    position: 'relative',
  },
  excerptIcon: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
    opacity: 0.3,
  },
  excerpt: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight * 1.2,
    fontWeight: typography.body.weight,
    color: colors.text,
    fontStyle: 'italic',
    paddingRight: spacing.xl,
  },

  // Content Card
  contentCard: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.l,
  },

  // Footer Card
  footerCard: {
    backgroundColor: colors.platinum,
    padding: spacing.xl,
    marginTop: spacing.l,
    marginBottom: spacing.xxl,
  },
  footerContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  footerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
    ...shadows.e1,
  },
  footerTitle: {
    fontSize: typography.title.size,
    fontWeight: typography.title.weight,
    color: colors.text,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  footerText: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: radius.md,
    gap: spacing.s,
    ...shadows.e1,
  },
  footerButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
  },
  
  // Skeleton states
  bodySkeleton: {
    gap: spacing.s,
  },

  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.title.size,
    lineHeight: typography.title.lineHeight,
    fontWeight: typography.title.weight,
    color: colors.text,
    marginTop: spacing.l,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.l,
    borderRadius: radius.md,
  },
  retryButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.medium,
    color: colors.ivory,
  },
});