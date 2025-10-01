import { AppHeader } from '@/src/components/AppHeader';
import { colors, spacing } from '@/src/design/tokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NEWS_ARTICLES = [
  {
    id: '1',
    title: 'Historic Gold Coin Discovery at Ancient Site',
    date: '2024-01-15',
    excerpt: 'Archaeologists uncover rare Byzantine gold coins dating back to the 6th century...',
    category: 'Archaeology'
  },
  {
    id: '2',
    title: 'Record-Breaking Silver Dollar Sells for $12 Million',
    date: '2024-01-12',
    excerpt: 'A pristine 1893-S Morgan Silver Dollar sets new auction record...',
    category: 'Auctions'
  },
  {
    id: '3',
    title: 'New Gold Investment Trends for 2024',
    date: '2024-01-10',
    excerpt: 'Experts predict continued growth in precious metals investment...',
    category: 'Investment'
  },
  {
    id: '4',
    title: 'Rare Double Eagle Found in Estate Sale',
    date: '2024-01-08',
    excerpt: 'Family discovers valuable 1933 Double Eagle in grandfather\'s collection...',
    category: 'Discovery'
  },
  {
    id: '5',
    title: 'Platinum Market Shows Strong Performance',
    date: '2024-01-05',
    excerpt: 'Platinum prices reach new highs amid industrial demand...',
    category: 'Market News'
  }
];

export default function RareCoinNewsPage() {
  const handleArticlePress = (articleId: string) => {
    // Navigate to full article
    console.log('Navigate to article:', articleId);
  };

  const renderNewsItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.newsItem}
      onPress={() => handleArticlePress(item.id)}
    >
      <View style={styles.newsContent}>
        <View style={styles.newsHeader}>
          <Text style={styles.newsCategory}>{item.category}</Text>
          <Text style={styles.newsDate}>{item.date}</Text>
        </View>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsExcerpt}>{item.excerpt}</Text>
        <View style={styles.newsFooter}>
          <Text style={styles.readMore}>Read More</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.gold} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Rare Coin News" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Rare Coin News</Text>
          <Text style={styles.subtitle}>Stay updated with the latest developments in numismatics and precious metals</Text>
        </View>

        <View style={styles.newsList}>
          {NEWS_ARTICLES.map((article) => (
            <View key={article.id}>
              {renderNewsItem({ item: article })}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For the latest news and updates, visit our website at finestknown.com
          </Text>
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
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  newsList: {
    marginBottom: spacing.xl,
  },
  newsItem: {
    backgroundColor: colors.ivory,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  newsContent: {
    flex: 1,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  newsCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gold,
    backgroundColor: colors.gold + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newsDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  newsExcerpt: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readMore: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gold,
  },
  footer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});