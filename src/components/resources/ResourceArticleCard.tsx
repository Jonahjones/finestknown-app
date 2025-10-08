import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../../design/tokens';

interface ResourceArticleCardProps {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string;
  resourceType?: string | null;
  coverUrl?: string | null;
  displayDate?: string | null;
}

export function ResourceArticleCard({
  slug,
  title,
  excerpt,
  publishedAt,
  resourceType,
  coverUrl,
  displayDate,
}: ResourceArticleCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePress = () => {
    router.push(`/learn/${slug}` as any);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {coverUrl && (
        <Image
          source={{ uri: coverUrl }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {displayDate || formatDate(publishedAt)}
            </Text>
          </View>
          {resourceType && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{resourceType}</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {excerpt && (
          <Text style={styles.excerpt} numberOfLines={3}>
            {excerpt}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.readMore}>Read Article</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.gold} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ivory,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.platinum,
    overflow: 'hidden',
    ...shadows.card,
  },
  coverImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.platinum,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  dateBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ivory,
  },
  typeBadge: {
    backgroundColor: colors.platinum,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.navy,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.navy,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  excerpt: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.platinum,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gold,
  },
});

