import { Category, getCategoryTree } from '@/src/api/categories';
import { listProducts, ProductRow } from '@/src/api/products';
import { AppHeader } from '@/src/components/AppHeader';
import { ProductCard } from '@/src/components/ProductCard';
import { colors, radii, shadow, spacing, type } from '@/src/theme';
import { analytics } from '@/src/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const GUTTER = 12; // 12px gutter between columns

export default function CatalogScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Fetch categories from database
  const { data: categoryTree, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoryTree,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', { category: selectedCategory }],
    queryFn: () => listProducts({ 
      categorySlug: selectedCategory === 'all' ? undefined : selectedCategory 
    }),
  });

  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    analytics.track('category_selected', { category: categoryId });
  }, []);

  const handleCategorySelect = useCallback((categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setShowCategoryDropdown(false);
    analytics.track('category_selected', { category: categorySlug });
  }, []);

  const handleProductPress = useCallback((productId: string) => {
    analytics.track('product_viewed', { productId });
    router.push(`/product/${productId}`);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    analytics.track('search_performed', { query });
  }, []);

  // Get product counts for each category
  const { data: categoryCounts } = useQuery({
    queryKey: ['categoryCounts'],
    queryFn: async () => {
      if (!categoryTree) return {};
      
      const counts: { [key: string]: number } = {};
      
      // Get count for "All" category
      const allProducts = await listProducts({ pageSize: 1 });
      counts['all'] = allProducts.count || 0;
      
      // Get counts for each category
      const flattenCategories = (categories: (Category & { children?: Category[] })[]): Category[] => {
        const result: Category[] = [];
        const addCategory = (cat: Category & { children?: Category[] }) => {
          result.push(cat);
          if (cat.children) {
            cat.children.forEach(addCategory);
          }
        };
        categories.forEach(addCategory);
        return result;
      };
      
      const flatCategories = flattenCategories(categoryTree);
      
      for (const category of flatCategories) {
        try {
          const products = await listProducts({ 
            categorySlug: category.slug, 
            pageSize: 1 
          });
          counts[category.slug] = products.count || 0;
        } catch (error) {
          console.error(`Error getting count for category ${category.slug}:`, error);
          counts[category.slug] = 0;
        }
      }
      
      return counts;
    },
    enabled: !!categoryTree,
  });

  // Flatten category tree for display
  const flattenCategories = (categories: (Category & { children?: Category[] })[]): Category[] => {
    const result: Category[] = [];
    const addCategory = (cat: Category & { children?: Category[] }) => {
      result.push(cat);
      if (cat.children) {
        cat.children.forEach(addCategory);
      }
    };
    categories.forEach(addCategory);
    return result;
  };

  const categories = categoryTree ? [
    { id: 'all', name: 'All', slug: 'all', parent_id: null, sort_order: 0 },
    ...flattenCategories(categoryTree)
  ] : [];

  const renderProduct = ({ item }: { item: ProductRow }) => (
    <View style={styles.productCardWrapper}>
      <ProductCard product={item} />
    </View>
  );

  const renderCategory = ({ item }: { item: Category & { id: string; name: string; slug: string } }) => (
        <TouchableOpacity
          style={[
        styles.categoryChip,
        selectedCategory === item.slug && styles.categoryChipSelected,
      ]}
      onPress={() => handleCategoryPress(item.slug)}
    >
            <Text
              style={[
          styles.categoryChipText,
          selectedCategory === item.slug && styles.categoryChipTextSelected,
        ]}
      >
        {item.name}
            </Text>
        </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Loading products...</Text>
          </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.danger} />
          <Text style={styles.errorText}>Failed to load products</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <AppHeader title="Catalog" showLivePrices={true} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
              placeholder="Search products..."
          placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>

      {/* Category Dropdown */}
      <View style={styles.categoryDropdownContainer}>
        <TouchableOpacity
          style={styles.categoryDropdownButton}
          onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
        >
          <Text style={styles.categoryDropdownText}>
            {categories.find(cat => cat.slug === selectedCategory)?.name || 'All Categories'}
          </Text>
          <Ionicons 
            name={showCategoryDropdown ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={colors.navy} 
          />
        </TouchableOpacity>
      </View>

      {/* Category Dropdown Modal */}
      <Modal
        visible={showCategoryDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <FlatList
              data={categories}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    selectedCategory === item.slug && styles.dropdownItemSelected
                  ]}
                  onPress={() => handleCategorySelect(item.slug)}
                >
                  <View style={styles.dropdownItemContent}>
                    <Text style={[
                      styles.dropdownItemText,
                      selectedCategory === item.slug && styles.dropdownItemTextSelected
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={[
                      styles.dropdownItemCount,
                      selectedCategory === item.slug && styles.dropdownItemCountSelected
                    ]}>
                      {categoryCounts?.[item.slug] || 0} items
                    </Text>
                  </View>
                  {selectedCategory === item.slug && (
                    <Ionicons name="checkmark" size={20} color={colors.gold} />
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Products Grid */}
      <FlatList
        data={data?.items || []}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsGrid}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    ...shadow.card,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    ...type.body,
    color: colors.text.primary,
  },
  categoryDropdownContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryDropdownText: {
    ...type.title,
    color: colors.text.primary,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    marginHorizontal: spacing.lg,
    maxHeight: 400,
    minWidth: 280,
    ...shadow.sticky,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: colors.bg,
  },
  dropdownItemContent: {
    flex: 1,
  },
  dropdownItemText: {
    ...type.title,
    color: colors.text.primary,
    marginBottom: 2,
  },
  dropdownItemTextSelected: {
    fontWeight: '700',
    color: colors.brand,
  },
  dropdownItemCount: {
    ...type.meta,
  },
  dropdownItemCountSelected: {
    color: colors.brand,
    fontWeight: '700',
  },
  categoriesContainer: {
    marginBottom: spacing.lg,
  },
  categoriesList: {
    paddingHorizontal: spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  categoryChipText: {
    ...type.meta,
    color: colors.text.primary,
    fontWeight: '700',
  },
  categoryChipTextSelected: {
    color: colors.surface,
  },
  productsGrid: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  productRow: {
    justifyContent: 'space-between',
    gap: GUTTER,
    marginBottom: GUTTER,
  },
  productCardWrapper: {
    width: (width - spacing.lg * 2 - GUTTER) / 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...type.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    ...type.h2,
    color: colors.text.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorSubtext: {
    ...type.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});