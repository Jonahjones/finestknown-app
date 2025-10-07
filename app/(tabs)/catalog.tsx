import { Category, getCategoryTree } from '@/src/api/categories';
import { listProducts, ProductRow } from '@/src/api/products';
import { AppHeader } from '@/src/components/AppHeader';
import { FilterSheet } from '@/src/components/FilterSheet';
import { ProductCard } from '@/src/components/ProductCard';
import { ProductCardSkeleton } from '@/src/components/ProductCardSkeleton';
import { colors, radii, shadow, spacing, type } from '@/src/theme';
import { analytics } from '@/src/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const GUTTER = 12;

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'name-asc';
type ViewMode = 'grid' | 'list';

interface FilterOptions {
  metal?: string;
  minPrice?: number;
  maxPrice?: number;
  yearMin?: number;
  yearMax?: number;
  inStockOnly?: boolean;
  newArrivals?: boolean;
}

export default function CatalogScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);

  // Fetch categories
  const { data: categoryTree = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoryTree,
  });

  // Fetch products
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', { category: selectedCategory }],
    queryFn: () => listProducts({ 
      categorySlug: selectedCategory === 'all' ? undefined : selectedCategory 
    }),
  });

  // Refetch on tab focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch category counts
  const { data: categoryCounts } = useQuery({
    queryKey: ['categoryCounts'],
    queryFn: async () => {
      const counts: { [key: string]: number } = {};
      
      // Get count for "All" category
      const allProducts = await listProducts({ pageSize: 1 });
      counts['all'] = allProducts.count || 0;
      
      return counts;
    },
  });

  // Create top-level category tabs
  const topLevelCategories = useMemo(() => {
    return [
      { id: 'all', name: 'All', slug: 'all' },
      ...categoryTree.slice(0, 5), // Show top 5 categories as tabs
    ];
  }, [categoryTree]);

  // Filter and sort products
  const processedProducts = useMemo(() => {
    let filtered = data?.items || [];

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.metal?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.metal) {
      filtered = filtered.filter(p => p.metal?.toLowerCase() === filters.metal?.toLowerCase());
    }
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price_cents >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price_cents <= filters.maxPrice!);
    }
    if (filters.inStockOnly) {
      filtered = filtered.filter(p => p.stock > 0);
    }
    // Note: created_at not available in ProductRow type, so we can't filter by new arrivals
    // if (filters.newArrivals) { ... }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price_cents - b.price_cents);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price_cents - a.price_cents);
        break;
      case 'newest':
        // Note: created_at not available, can't sort by newest
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // 'featured' - keep original order
        break;
    }

    return filtered;
  }, [data?.items, debouncedSearch, filters, sortBy]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.metal) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.inStockOnly) count++;
    if (filters.newArrivals) count++;
    return count;
  }, [filters]);

  // Handlers
  const handleCategorySelect = useCallback((slug: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(slug);
    analytics.track('category_selected', { category: slug });

    // Animate tab indicator
    const index = topLevelCategories.findIndex(c => c.slug === slug);
    Animated.spring(tabIndicatorAnim, {
      toValue: index,
      useNativeDriver: true,
      tension: 120,
      friction: 10,
    }).start();
  }, [topLevelCategories, tabIndicatorAnim]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query) {
      analytics.track('search_performed', { query });
    }
  }, []);

  const clearSearch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery('');
    setDebouncedSearch('');
    searchInputRef.current?.blur();
  }, []);

  const handleApplyFilters = useCallback((newFilters: FilterOptions) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFilters(newFilters);
    analytics.track('filters_applied', { filters: newFilters });
  }, []);

  const clearFilters = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters({});
  }, []);

  const handleToggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSortSelect = useCallback((option: SortOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortBy(option);
    setShowSortMenu(false);
    analytics.track('sort_changed', { sort: option });
  }, []);

  const toggleViewMode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  // Quick filter toggle
  const toggleQuickFilter = useCallback((filter: keyof FilterOptions, value: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters(prev => ({
      ...prev,
      [filter]: prev[filter] === value ? undefined : value,
    }));
  }, []);

  // Render functions
  const renderProduct = useCallback(({ item, index }: { item: ProductRow; index: number }) => {
    if (viewMode === 'list') {
      return (
        <ProductCard
          product={item}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={favorites.has(item.id)}
          viewMode="list"
        />
      );
    }

    return (
      <View style={styles.productCardWrapper}>
        <ProductCard
          product={item}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={favorites.has(item.id)}
          viewMode="grid"
        />
      </View>
    );
  }, [viewMode, favorites, handleToggleFavorite]);

  const renderSkeletonGrid = () => (
    <View style={styles.skeletonGrid}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={styles.productCardWrapper}>
          <ProductCardSkeleton />
        </View>
      ))}
    </View>
  );

  const renderEmptyState = () => {
    const isSearching = debouncedSearch.length > 0;
    const hasFilters = activeFilterCount > 0;

    let icon: any = 'albums-outline';
    let title = 'No products found';
    let message = 'Check back later for new arrivals';
    let action = null;

    if (isSearching) {
      icon = 'search-outline';
      title = `No results for "${debouncedSearch}"`;
      message = hasFilters ? 'Try removing some filters' : 'Try a different search term';
      action = (
        <TouchableOpacity style={styles.emptyButton} onPress={clearSearch}>
          <Text style={styles.emptyButtonText}>Clear Search</Text>
        </TouchableOpacity>
      );
    } else if (hasFilters) {
      icon = 'filter-outline';
      title = 'No matches';
      message = 'Try adjusting your filters';
      action = (
        <TouchableOpacity style={styles.emptyButton} onPress={clearFilters}>
          <Text style={styles.emptyButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name={icon} size={64} color={colors.text.muted} />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
        {action}
      </View>
    );
  };

  const renderHeader = () => (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.secondary} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={colors.text.secondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsScrollContainer}>
          {topLevelCategories.map((category, index) => {
            // Calculate the count to show for this category
            const categoryCount = selectedCategory === category.slug 
              ? processedProducts.length 
              : (categoryCounts?.[category.slug] ?? data?.count ?? 0);

            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.tab,
                  selectedCategory === category.slug && styles.tabActive
                ]}
                onPress={() => handleCategorySelect(category.slug)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedCategory === category.slug && styles.tabTextActive
                  ]}
                >
                  {category.name}
                </Text>
                {/* Always show badge to prevent size changes */}
                <View style={[
                  styles.tabBadge,
                  selectedCategory === category.slug && styles.tabBadgeActive
                ]}>
                  <Text style={[
                    styles.tabBadgeText,
                    selectedCategory === category.slug && styles.tabBadgeTextActive
                  ]}>
                    {categoryCount}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Animated indicator */}
        {topLevelCategories.length > 0 && (
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                transform: [{
                  translateX: tabIndicatorAnim.interpolate({
                    inputRange: [0, topLevelCategories.length - 1],
                    outputRange: [0, (width / topLevelCategories.length) * (topLevelCategories.length - 1)],
                  }),
                }],
                width: width / topLevelCategories.length,
              },
            ]}
          />
        )}
      </View>

      {/* Quick Filters Bar */}
      <View style={styles.quickFiltersContainer}>
        <TouchableOpacity
          style={[styles.quickFilter, filters.inStockOnly && styles.quickFilterActive]}
          onPress={() => toggleQuickFilter('inStockOnly', true)}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={16} 
            color={filters.inStockOnly ? colors.surface : colors.brand} 
          />
          <Text style={[
            styles.quickFilterText,
            filters.inStockOnly && styles.quickFilterTextActive
          ]}>
            In Stock
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickFilter, filters.newArrivals && styles.quickFilterActive]}
          onPress={() => toggleQuickFilter('newArrivals', true)}
        >
          <Ionicons 
            name="sparkles" 
            size={16} 
            color={filters.newArrivals ? colors.surface : colors.brand} 
          />
          <Text style={[
            styles.quickFilterText,
            filters.newArrivals && styles.quickFilterTextActive
          ]}>
            New
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {/* Filter Button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowFilterSheet(true);
          }}
        >
          <Ionicons name="options-outline" size={20} color={colors.brand} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Sort Button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowSortMenu(true);
          }}
        >
          <Ionicons name="swap-vertical" size={20} color={colors.brand} />
        </TouchableOpacity>

        {/* View Toggle */}
        <TouchableOpacity style={styles.filterButton} onPress={toggleViewMode}>
          <Ionicons 
            name={viewMode === 'grid' ? 'list' : 'grid'} 
            size={20} 
            color={colors.brand} 
          />
        </TouchableOpacity>
      </View>

      {/* Active Filters Bar */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersBar}>
          <Text style={styles.activeFiltersText}>
            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
          </Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  // Loading state
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Catalog" showLivePrices={true} />
        {renderHeader()}
        {renderSkeletonGrid()}
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Catalog" showLivePrices={true} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.danger} />
          <Text style={styles.errorTitle}>Failed to load products</Text>
          <Text style={styles.errorMessage}>Please try again later</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Catalog" showLivePrices={true} />

      <FlatList
        data={processedProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={viewMode === 'grid' ? styles.gridContent : styles.listContent}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand}
          />
        }
      />

      {/* Filter Sheet */}
      <FilterSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />

      {/* Sort Menu */}
      <Modal
        visible={showSortMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortMenu(false)}
        >
          <View style={styles.sortMenu}>
            <Text style={styles.sortMenuTitle}>Sort By</Text>
            
            {[
              { id: 'featured' as SortOption, label: 'Featured', icon: 'star' },
              { id: 'price-asc' as SortOption, label: 'Price: Low to High', icon: 'arrow-up' },
              { id: 'price-desc' as SortOption, label: 'Price: High to Low', icon: 'arrow-down' },
              { id: 'newest' as SortOption, label: 'Newest First', icon: 'time' },
              { id: 'name-asc' as SortOption, label: 'Name: A to Z', icon: 'text' },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortMenuItem,
                  sortBy === option.id && styles.sortMenuItemActive
                ]}
                onPress={() => handleSortSelect(option.id)}
              >
                <View style={styles.sortMenuItemContent}>
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={sortBy === option.id ? colors.brand : colors.text.secondary}
                  />
                  <Text style={[
                    styles.sortMenuItemText,
                    sortBy === option.id && styles.sortMenuItemTextActive
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {sortBy === option.id && (
                  <Ionicons name="checkmark" size={20} color={colors.brand} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
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

  // Tabs
  tabsContainer: {
    position: 'relative',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsScrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tabActive: {
    // Active styling handled by indicator
  },
  tabText: {
    ...type.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.brand,
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: colors.brand,
  },
  tabBadgeText: {
    ...type.meta,
    color: colors.text.secondary,
    fontWeight: '700',
    fontSize: 10,
  },
  tabBadgeTextActive: {
    color: colors.surface,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: colors.brand,
    borderRadius: 2,
  },

  // Quick Filters
  quickFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.brand,
    backgroundColor: colors.surface,
  },
  quickFilterActive: {
    backgroundColor: colors.brand,
  },
  quickFilterText: {
    ...type.meta,
    color: colors.brand,
    fontWeight: '700',
  },
  quickFilterTextActive: {
    color: colors.surface,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    ...type.meta,
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },

  // Active Filters Bar
  activeFiltersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.brand + '10',
    borderBottomWidth: 1,
    borderBottomColor: colors.brand + '20',
  },
  activeFiltersText: {
    ...type.meta,
    color: colors.brand,
    fontWeight: '700',
  },
  clearFiltersText: {
    ...type.meta,
    color: colors.brand,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Grid/List Layout
  gridContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  gridRow: {
    gap: GUTTER,
    marginBottom: GUTTER,
  },
  productCardWrapper: {
    width: (width - spacing.lg * 2 - GUTTER) / 2,
  },

  // Skeleton
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: GUTTER,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    ...type.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptyMessage: {
    ...type.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.brand,
    borderRadius: radii.pill,
  },
  emptyButtonText: {
    ...type.body,
    color: colors.surface,
    fontWeight: '700',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    ...type.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  errorMessage: {
    ...type.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.danger,
    borderRadius: radii.pill,
  },
  retryButtonText: {
    ...type.body,
    color: colors.surface,
    fontWeight: '700',
  },

  // Sort Menu
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sortMenu: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadow.sticky,
  },
  sortMenuTitle: {
    ...type.h2,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sortMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sortMenuItemActive: {
    backgroundColor: colors.bg,
  },
  sortMenuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sortMenuItemText: {
    ...type.body,
    color: colors.text.secondary,
  },
  sortMenuItemTextActive: {
    color: colors.brand,
    fontWeight: '700',
  },
});
