import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Category, getCategoryTree } from '../api/categories';
import { borderRadius, colors, spacing, typography } from '../design/tokens';

interface CategoryTreeDropdownProps {
  onCategorySelect: (category: Category & { children?: Category[] }) => void;
  selectedCategoryId?: string;
}

export function CategoryTreeDropdown({ onCategorySelect, selectedCategoryId }: CategoryTreeDropdownProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch category tree
  const { data: categoryTree = [], isLoading, error } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: async () => {
      console.log('CategoryTreeDropdown - Calling getCategoryTree...');
      const result = await getCategoryTree();
      console.log('CategoryTreeDropdown - getCategoryTree result:', result);
      console.log('CategoryTreeDropdown - result length:', result?.length);
      return result;
    },
  });

  console.log('CategoryTreeDropdown - isLoading:', isLoading);
  console.log('CategoryTreeDropdown - error:', error);
  console.log('CategoryTreeDropdown - categoryTree:', categoryTree);
  console.log('CategoryTreeDropdown - categoryTree.length:', categoryTree?.length);

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategoryId === category.id;

    return (
      <View key={category.id}>
        <TouchableOpacity
          style={[
            styles.categoryItem,
            { paddingLeft: spacing.md + (level * spacing.lg) },
            isSelected && styles.categoryItemSelected,
          ]}
          onPress={() => {
            if (hasChildren) {
              toggleExpanded(category.id);
            }
            onCategorySelect(category);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.categoryContent}>
            {hasChildren && (
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.slate}
                style={[
                  styles.chevron,
                  isExpanded && styles.chevronExpanded,
                ]}
              />
            )}
            <Text
              style={[
                styles.categoryText,
                level === 0 && styles.categoryTextMain,
                level === 1 && styles.categoryTextSub,
                level >= 2 && styles.categoryTextLeaf,
                isSelected && styles.categoryTextSelected,
              ]}
            >
              {category.name}
            </Text>
          </View>
        </TouchableOpacity>

        {hasChildren && isExpanded && (
          <View>
            {category.children!.map(child => renderCategory(child, level + 1))}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load categories</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
      </View>
    );
  }

  if (categoryTree.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Browse Categories</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No categories found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse Categories</Text>
      <FlatList
        data={categoryTree}
        renderItem={({ item }) => renderCategory(item)}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.categoryList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 400,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.navy,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  categoryList: {
    flex: 1,
  },
  categoryItem: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: borderRadius.sm,
    marginVertical: 1,
  },
  categoryItemSelected: {
    backgroundColor: colors.navy + '10',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginRight: spacing.sm,
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  categoryText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.navy,
  },
  categoryTextMain: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.base,
    color: colors.navy,
  },
  categoryTextSub: {
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.base,
    color: colors.navy,
  },
  categoryTextLeaf: {
    fontWeight: typography.weights.medium,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  categoryTextSelected: {
    color: colors.navy,
    fontWeight: typography.weights.bold,
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.slate,
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.danger,
    fontWeight: '600',
  },
  errorSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.slate,
    marginTop: spacing.xs,
  },
});
