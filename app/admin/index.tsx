import { adminDeleteProduct, adminListProducts, AdminProduct } from '@/src/api/admin';
import { AppHeader } from '@/src/components/AppHeader';
import { AuthWrapper } from '@/src/components/AuthWrapper';
import { Button, Card, Input } from '@/src/components/ui';
import { colors, radius, shadows, spacing, typography } from '@/src/design/tokens';
import { useIsAdmin } from '@/src/hooks/useIsAdmin';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function AdminIndexScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  const { 
    data: products = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['adminProducts', searchQuery],
    queryFn: () => adminListProducts({ search: searchQuery, limit: 50 }),
    enabled: isAdmin === true,
    staleTime: 30 * 1000, // 30 seconds
  });

  const deleteProductMutation = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      Alert.alert('Success', 'Product deleted successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to delete product');
    }
  });

  // Show loading while checking admin status
  if (isAdminLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.navy} />
          <Text style={styles.loadingText}>Checking permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show access denied if not admin
  if (isAdmin === false) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Access Denied" />
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="shield-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.accessDeniedTitle}>Admin Access Required</Text>
          <Text style={styles.accessDeniedText}>
            You don't have permission to access the admin panel.
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.goBackButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleDeleteProduct = (product: AdminProduct) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProductMutation.mutate(product.id!)
        }
      ]
    );
  };

  const renderProduct = ({ item }: { item: AdminProduct }) => (
    <Card elevation="e2" style={styles.productCard}>
      <View style={styles.productContent}>
        {/* Product Image */}
        <View style={styles.productImageContainer}>
          <Image
            source={{
              uri: item.photos?.[0] || 'https://via.placeholder.com/80x100/F8F7F4/C9D1D9?text=No+Image'
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {item.stock === 0 && (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>SOLD</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productSku}>SKU: {item.sku || 'N/A'}</Text>
          <View style={styles.productMeta}>
            <Text style={styles.productPrice}>
              ${(item.price_cents / 100).toFixed(2)}
            </Text>
            <View style={[
              styles.stockBadge,
              { backgroundColor: item.stock === 0 ? colors.danger + '20' : colors.success + '20' }
            ]}>
              <Ionicons 
                name={item.stock === 0 ? "close-circle" : "checkmark-circle"} 
                size={12} 
                color={item.stock === 0 ? colors.danger : colors.success} 
              />
              <Text style={[
                styles.stockText,
                { color: item.stock === 0 ? colors.danger : colors.success }
              ]}>
                {item.stock} in stock
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/admin/${item.id}`)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={18} color={colors.navy} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteActionButton]}
            onPress={() => handleDeleteProduct(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <AuthWrapper>
      <SafeAreaView style={styles.container}>
        {/* Modern Header with Gradient */}
        <LinearGradient
          colors={[colors.navy, colors.navy + 'E6']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="shield-checkmark" size={24} color={colors.ivory} />
              <Text style={styles.headerTitle}>Admin Dashboard</Text>
            </View>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => {/* Settings functionality */}}
            >
              <Ionicons name="settings-outline" size={24} color={colors.ivory} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <Card elevation="e2" style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name="cube-outline" size={24} color={colors.navy} />
                </View>
                <Text style={styles.statNumber}>{products.length}</Text>
                <Text style={styles.statLabel}>Total Products</Text>
              </Card>
              
              <Card elevation="e2" style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
                </View>
                <Text style={styles.statNumber}>
                  {products.filter(p => p.stock > 0).length}
                </Text>
                <Text style={styles.statLabel}>In Stock</Text>
              </Card>
            </View>
            
            <View style={styles.statsRow}>
              <Card elevation="e2" style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name="warning-outline" size={24} color={colors.danger} />
                </View>
                <Text style={styles.statNumber}>
                  {products.filter(p => p.stock === 0).length}
                </Text>
                <Text style={styles.statLabel}>Out of Stock</Text>
              </Card>
              
              <Card elevation="e2" style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name="diamond-outline" size={24} color={colors.gold} />
                </View>
                <Text style={styles.statNumber}>
                  ${products.reduce((sum, p) => sum + (p.price_cents / 100), 0).toFixed(0)}
                </Text>
                <Text style={styles.statLabel}>Total Value</Text>
              </Card>
            </View>
          </View>

          {/* Search and Actions */}
          <View style={styles.actionsSection}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                />
              </View>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => {/* Filter functionality */}}
              >
                <Ionicons name="filter-outline" size={20} color={colors.navy} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={styles.auctionsButton}
                onPress={() => router.push('/admin/auctions')}
                activeOpacity={0.8}
              >
                <Ionicons name="flash" size={20} color={colors.gold} />
                <Text style={styles.auctionsButtonText}>Auctions</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.newProductButton}
                onPress={() => router.push('/admin/new')}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color={colors.ivory} />
                <Text style={styles.newProductButtonText}>New Product</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Products List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.navy} />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
              <Text style={styles.errorTitle}>Failed to load products</Text>
              <Text style={styles.errorText}>Please check your connection and try again.</Text>
              <Button title="Retry" onPress={() => refetch()} />
            </View>
          ) : (
            <View style={styles.productsSection}>
              <Text style={styles.sectionTitle}>Products ({products.length})</Text>
              <FlatList
                data={products}
                keyExtractor={(item) => item.id!}
                renderItem={renderProduct}
                contentContainerStyle={styles.productsList}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                      <Ionicons name="cube-outline" size={48} color={colors.textTertiary} />
                    </View>
                    <Text style={styles.emptyTitle}>No products found</Text>
                    <Text style={styles.emptyText}>
                      {searchQuery ? 'Try adjusting your search' : 'Create your first product to get started'}
                    </Text>
                    {!searchQuery && (
                      <TouchableOpacity 
                        style={styles.emptyButton}
                        onPress={() => router.push('/admin/new')}
                      >
                        <Text style={styles.emptyButtonText}>Create Product</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                }
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  headerGradient: {
    paddingTop: spacing.s,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.title.size,
    lineHeight: typography.title.lineHeight,
    fontWeight: typography.title.weight,
    color: colors.ivory,
    marginLeft: spacing.s,
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: colors.navy + '20',
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    padding: spacing.l,
    gap: spacing.m,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  statCard: {
    flex: 1,
    padding: spacing.l,
    alignItems: 'center',
    borderRadius: radius.lg,
    ...shadows.e2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.platinum,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  statNumber: {
    fontSize: typography.heading.size,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.weight,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.caption.weight,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.l,
    gap: spacing.m,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.platinum,
    borderRadius: radius.md,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  searchIcon: {
    marginRight: spacing.s,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.platinum,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  auctionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ivory,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.gold,
    minHeight: 48,
    ...shadows.e1,
  },
  auctionsButtonText: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
    marginLeft: spacing.s,
  },
  newProductButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: radius.lg,
    minHeight: 48,
    ...shadows.e2,
  },
  newProductButtonText: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.ivory,
    marginLeft: spacing.s,
  },
  productsSection: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.heading.size,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.weight,
    color: colors.navy,
    marginBottom: spacing.m,
  },
  productsList: {
    gap: spacing.m,
  },
  productCard: {
    borderRadius: radius.lg,
    ...shadows.e1,
  },
  productContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.l,
  },
  productImageContainer: {
    position: 'relative',
    marginRight: spacing.m,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.platinum,
  },
  soldOutBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.ivory,
  },
  soldOutText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.ivory,
  },
  productInfo: {
    flex: 1,
    marginRight: spacing.m,
  },
  productTitle: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productSku: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.caption.weight,
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.gold,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  stockText: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.xs,
  },
  productActions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.platinum,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionButton: {
    backgroundColor: colors.danger + '20',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
    marginTop: spacing.m,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  accessDeniedTitle: {
    fontSize: typography.title.size,
    fontWeight: typography.title.weight,
    color: colors.text,
    marginTop: spacing.l,
    marginBottom: spacing.m,
  },
  accessDeniedText: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  goBackButton: {
    minWidth: 120,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  errorTitle: {
    fontSize: typography.title.size,
    fontWeight: typography.title.weight,
    color: colors.navy,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  errorText: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.platinum,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  emptyTitle: {
    fontSize: typography.heading.size,
    fontWeight: typography.heading.weight,
    color: colors.navy,
    marginBottom: spacing.s,
  },
  emptyText: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  emptyButton: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: radius.lg,
    minHeight: 44,
  },
  emptyButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.ivory,
  },
});


