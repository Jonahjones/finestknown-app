import {
    adminDeleteProduct,
    adminGetProduct,
    AdminProduct,
    adminUpdateProduct,
    deleteProductImage,
    pickProductImage,
    uploadProductImage
} from '@/src/api/admin';
import { createDiscount, deleteDiscount, getProductDiscounts, updateDiscount } from '@/src/api/discounts';
import { AppHeader } from '@/src/components/AppHeader';
import { AuthWrapper } from '@/src/components/AuthWrapper';
import { CategoryPicker } from '@/src/components/CategoryPicker';
import { DatePicker } from '@/src/components/DatePicker';
import { Button, Card, Input } from '@/src/components/ui';
import { colors, radius, shadows, spacing, typography } from '@/src/design/tokens';
import { useIsAdmin } from '@/src/hooks/useIsAdmin';
import { supabase } from '@/src/lib/supabase';
import { Discount, DiscountForm } from '@/src/types/discount';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProductForm {
  title: string;
  sku: string;
  category_primary: string;
  category_slug: string;
  price: string;
  compare_at_price: string;
  stock: string;
  description: string;
  metal: string;
  fineness: string;
  weight_grams: string;
  year: string;
  mint: string;
  grade: string;
  grader: string;
  cert_number: string;
  population_url: string;
  inventory_qty: string;
  is_active: boolean;
  is_auction: boolean;
  rarity_score: string;
}

export default function AdminEditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  
  // Discount management state
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [discountForm, setDiscountForm] = useState<DiscountForm>({
    type: 'PERCENT',
    value: '',
    starts_at: '',
    ends_at: '',
    is_featured: false,
    active: true,
  });
  
  const [form, setForm] = useState<ProductForm>({
    title: '',
    sku: '',
    category_primary: '',
    category_slug: '',
    price: '',
    compare_at_price: '',
    stock: '',
    description: '',
    metal: '',
    fineness: '',
    weight_grams: '',
    year: '',
    mint: '',
    grade: '',
    grader: '',
    cert_number: '',
    population_url: '',
    inventory_qty: '',
    is_active: true,
    is_auction: false,
    rarity_score: '',
  });
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch categories that have products assigned to them
  const { data: categories = [] } = useQuery({
    queryKey: ['categoriesWithProducts'],
    queryFn: async () => {
      // Get all categories that have products
      const { data, error } = await supabase
        .rpc('get_categories_with_products');
      
      if (error) {
        // Fallback to regular query if RPC doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name');
        if (fallbackError) throw fallbackError;
        return fallbackData;
      }
      
      return data;
    },
    enabled: isAdmin === true,
  });

  // Fetch product data
  const { 
    data: product, 
    isLoading: isProductLoading, 
    error: productError 
  } = useQuery({
    queryKey: ['adminProduct', id],
    queryFn: () => adminGetProduct(id!),
    enabled: isAdmin === true && !!id,
  });

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      console.log('🔧 AdminEdit: Product loaded:', {
        title: product.title,
        stock: product.stock,
        category_primary: product.category_primary
      });
      
      setForm({
        title: product.title || '',
        sku: product.sku || '',
        category_primary: product.category_primary || '',
        category_slug: '', // Will be set when category is fetched
        price: (product.price_cents / 100).toString(),
        compare_at_price: product.compare_at_cents ? (product.compare_at_cents / 100).toString() : '',
        stock: product.stock?.toString() || '0',
        description: product.description || '',
        metal: product.metal || '',
        fineness: product.fineness?.toString() || '',
        weight_grams: product.weight_grams?.toString() || '',
        year: product.year?.toString() || '',
        mint: product.mint || '',
        grade: product.grade || '',
        grader: product.grader || '',
        cert_number: product.cert_number || '',
        population_url: product.population_url || '',
        inventory_qty: product.inventory_qty?.toString() || '',
        is_active: product.is_active ?? true,
        is_auction: product.is_auction ?? false,
        rarity_score: product.rarity_score?.toString() || '',
      });
      setCurrentImageUrl(product.photos?.[0] || null);
    }
  }, [product]);

  // Set category slug when categories are loaded and product has category_primary
  useEffect(() => {
    if (product?.category_primary && categories.length > 0) {
      const category = categories.find(cat => cat.id === product.category_primary);
      if (category) {
        setForm(prev => ({
          ...prev,
          category_slug: category.slug
        }));
      }
    }
  }, [product?.category_primary, categories]);

  // Load discounts when product loads
  useEffect(() => {
    if (id) {
      loadDiscounts();
    }
  }, [id]);

  const loadDiscounts = async () => {
    try {
      const discountData = await getProductDiscounts(id!);
      setDiscounts(discountData);
    } catch (error) {
      console.error('Error loading discounts:', error);
    }
  };

  const handleDiscountSubmit = async () => {
    try {
      if (editingDiscount) {
        await updateDiscount(editingDiscount.id, discountForm);
        Alert.alert('Success', 'Discount updated successfully');
      } else {
        await createDiscount(id!, discountForm);
        Alert.alert('Success', 'Discount created successfully');
      }
      
      setShowDiscountForm(false);
      setEditingDiscount(null);
      setDiscountForm({
        type: 'PERCENT',
        value: '',
        starts_at: '',
        ends_at: '',
        is_featured: false,
        active: true,
      });
      loadDiscounts();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save discount');
    }
  };

  const handleEditDiscount = (discount: Discount) => {
    setEditingDiscount(discount);
    setDiscountForm({
      type: discount.type,
      value: discount.value.toString(),
      starts_at: discount.starts_at,
      ends_at: discount.ends_at,
      is_featured: discount.is_featured,
      active: discount.active,
    });
    setShowDiscountForm(true);
  };

  const handleDeleteDiscount = async (discountId: string) => {
    Alert.alert(
      'Delete Discount',
      'Are you sure you want to delete this discount?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDiscount(discountId);
              Alert.alert('Success', 'Discount deleted successfully');
              loadDiscounts();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete discount');
            }
          }
        }
      ]
    );
  };

  const calculateSalePrice = (basePrice: number, type: 'PERCENT' | 'AMOUNT', value: number): number => {
    if (type === 'AMOUNT') {
      return Math.max(0, Math.round((basePrice - value) * 100) / 100);
    } else {
      const discountAmount = basePrice * (value / 100);
      return Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100);
    }
  };

  const calculatePercentOff = (basePrice: number, salePrice: number): number => {
    if (basePrice === 0) return 0;
    return Math.round((1 - salePrice / basePrice) * 100);
  };

  const updateProductMutation = useMutation({
    mutationFn: async () => {
      let photoUrls = product?.photos || [];
      
      // Handle image changes
      if (selectedImageUri) {
        setIsUploading(true);
        try {
          // Delete old image if exists
          if (currentImageUrl) {
            try {
              await deleteProductImage(currentImageUrl);
            } catch (error) {
              console.warn('Failed to delete old image:', error);
            }
          }
          
          // Upload new image
          const imageUrl = await uploadProductImage(selectedImageUri);
          photoUrls = [imageUrl];
        } catch (error) {
          console.error('Image upload failed:', error);
          throw new Error('Failed to upload product image');
        } finally {
          setIsUploading(false);
        }
      }

      // Update product
      const updates: Partial<AdminProduct> = {
        title: form.title.trim(),
        sku: form.sku.trim().toUpperCase(),
        category_primary: form.category_primary || undefined,
        price_cents: Math.round(parseFloat(form.price) * 100),
        compare_at_cents: form.compare_at_price ? Math.round(parseFloat(form.compare_at_price) * 100) : undefined,
        stock: parseInt(form.stock) || 0,
        description: form.description.trim() || undefined,
        metal: form.metal.trim() || undefined,
        fineness: form.fineness ? parseFloat(form.fineness) : undefined,
        weight_grams: form.weight_grams ? parseFloat(form.weight_grams) : undefined,
        year: form.year ? parseInt(form.year) : undefined,
        mint: form.mint.trim() || undefined,
        grade: form.grade.trim() || undefined,
        grader: form.grader.trim() || undefined,
        cert_number: form.cert_number.trim() || undefined,
        population_url: form.population_url.trim() || undefined,
        inventory_qty: form.inventory_qty ? parseInt(form.inventory_qty) : undefined,
        is_active: form.is_active,
        is_auction: form.is_auction,
        rarity_score: form.rarity_score ? parseInt(form.rarity_score) : undefined,
        photos: photoUrls.length > 0 ? photoUrls : undefined,
      };

      return adminUpdateProduct(id!, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminProduct', id] });
      Alert.alert('Success', 'Product updated successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to update product');
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: () => adminDeleteProduct(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      Alert.alert('Success', 'Product deleted successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to delete product');
    }
  });

  const handleImagePick = async () => {
    try {
      const imageUri = await pickProductImage();
      if (imageUri) {
        setSelectedImageUri(imageUri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const handleUpdate = () => {
    // Validation
    if (!form.title.trim()) {
      Alert.alert('Validation Error', 'Product title is required');
      return;
    }
    if (!form.sku.trim()) {
      Alert.alert('Validation Error', 'SKU is required');
      return;
    }
    if (!form.category_primary) {
      Alert.alert('Validation Error', 'Category is required');
      return;
    }
    if (!form.price.trim() || isNaN(parseFloat(form.price))) {
      Alert.alert('Validation Error', 'Valid price is required');
      return;
    }
    if (!form.stock.trim() || isNaN(parseInt(form.stock))) {
      Alert.alert('Validation Error', 'Valid stock quantity is required');
      return;
    }

    updateProductMutation.mutate();
  };

  const handleCategorySelect = (category: any) => {
    setForm(prev => ({
      ...prev,
      category_primary: category.id,
      category_slug: category.slug,
    }));
  };

  const handleDelete = () => {
    const isReferenced = product && product.is_active === false;
    
    Alert.alert(
      'Delete Product',
      isReferenced 
        ? `This product "${product?.title}" is referenced in orders and will be deactivated (soft deleted). You can reactivate it later if needed.`
        : `Are you sure you want to delete "${product?.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isReferenced ? 'Deactivate' : 'Delete',
          style: 'destructive',
          onPress: () => deleteProductMutation.mutate()
        }
      ]
    );
  };

  // Show loading while checking admin status
  if (isAdminLoading || isProductLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.navy} />
          <Text style={styles.loadingText}>
            {isAdminLoading ? 'Checking permissions...' : 'Loading product...'}
          </Text>
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
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  // Show error if product not found
  if (productError || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Product Not Found" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found or failed to load</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const isLoading = updateProductMutation.isPending || deleteProductMutation.isPending || isUploading;
  const displayImageUri = selectedImageUri || currentImageUrl;

  return (
    <AuthWrapper>
      <SafeAreaView style={styles.container}>
        <AppHeader title="Edit Product" />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Inactive Product Warning */}
          {product && product.is_active === false && (
            <Card elevation="e1" style={styles.warningCard}>
              <View style={styles.warningContent}>
                <Ionicons name="warning" size={24} color={colors.orange} />
                <Text style={styles.warningText}>
                  This product is inactive and not visible to customers. It may be referenced in past orders.
                </Text>
              </View>
            </Card>
          )}

          {/* Product Image */}
          <Card elevation="e1" style={styles.section}>
            <Text style={styles.sectionTitle}>Product Image</Text>
            <TouchableOpacity
              style={styles.imagePickerContainer}
              onPress={handleImagePick}
              disabled={isLoading}
            >
              {displayImageUri ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: displayImageUri }} style={styles.selectedImage} />
                  {selectedImageUri && (
                    <View style={styles.imageOverlay}>
                      <Text style={styles.imageOverlayText}>New Image Selected</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={32} color={colors.textSecondary} />
                  <Text style={styles.imagePlaceholderText}>Tap to select image</Text>
                </View>
              )}
            </TouchableOpacity>
          </Card>

          {/* Basic Information */}
          <Card elevation="e1" style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="Product Title"
              placeholder="e.g., 2024 Silver Eagle 1oz"
              value={form.title}
              onChangeText={(text) => setForm(prev => ({ ...prev, title: text }))}
              style={styles.input}
              required
            />

            <Input
              label="SKU"
              placeholder="e.g., SE2024-1OZ"
              value={form.sku}
              onChangeText={(text) => setForm(prev => ({ ...prev, sku: text.toUpperCase() }))}
              style={styles.input}
              autoCapitalize="characters"
              required
            />

            <View style={styles.input}>
              <Text style={styles.inputLabel}>Category *</Text>
              <CategoryPicker
                selectedCategorySlug={form.category_slug}
                onCategorySelect={handleCategorySelect}
                categories={categories}
                placeholder="Select a category..."
              />
            </View>

            <Input
              label="Description"
              placeholder="Detailed product description..."
              value={form.description}
              onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
              style={styles.textArea}
              multiline
              numberOfLines={4}
            />
          </Card>

          {/* Pricing & Inventory */}
          <Card elevation="e1" style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing & Inventory</Text>
            
            <Input
              label="Price (USD)"
              placeholder="0.00"
              value={form.price}
              onChangeText={(text) => setForm(prev => ({ ...prev, price: text }))}
              style={styles.input}
              keyboardType="decimal-pad"
              leftIcon="cash"
              required
            />

            <Input
              label="Compare At Price (USD)"
              placeholder="0.00"
              value={form.compare_at_price}
              onChangeText={(text) => setForm(prev => ({ ...prev, compare_at_price: text }))}
              style={styles.input}
              keyboardType="decimal-pad"
            />

            <Input
              label="Stock Quantity"
              placeholder="0"
              value={form.stock}
              onChangeText={(text) => setForm(prev => ({ ...prev, stock: text }))}
              style={styles.input}
              keyboardType="number-pad"
              required
            />

            <Input
              label="Inventory Quantity"
              placeholder="0"
              value={form.inventory_qty}
              onChangeText={(text) => setForm(prev => ({ ...prev, inventory_qty: text }))}
              style={styles.input}
              keyboardType="number-pad"
            />
          </Card>

          {/* Product Specifications */}
          <Card elevation="e1" style={styles.section}>
            <Text style={styles.sectionTitle}>Product Specifications</Text>
            
            <Input
              label="Metal"
              placeholder="e.g., Silver, Gold, Platinum"
              value={form.metal}
              onChangeText={(text) => setForm(prev => ({ ...prev, metal: text }))}
              style={styles.input}
            />

            <Input
              label="Fineness"
              placeholder="e.g., 0.999"
              value={form.fineness}
              onChangeText={(text) => setForm(prev => ({ ...prev, fineness: text }))}
              style={styles.input}
              keyboardType="decimal-pad"
            />

            <Input
              label="Weight (grams)"
              placeholder="e.g., 31.1035"
              value={form.weight_grams}
              onChangeText={(text) => setForm(prev => ({ ...prev, weight_grams: text }))}
              style={styles.input}
              keyboardType="decimal-pad"
            />

            <Input
              label="Year"
              placeholder="e.g., 2024"
              value={form.year}
              onChangeText={(text) => setForm(prev => ({ ...prev, year: text }))}
              style={styles.input}
              keyboardType="number-pad"
            />

            <Input
              label="Mint"
              placeholder="e.g., US Mint, Royal Canadian Mint"
              value={form.mint}
              onChangeText={(text) => setForm(prev => ({ ...prev, mint: text }))}
              style={styles.input}
            />
          </Card>

          {/* Grading Information */}
          <Card elevation="e1" style={styles.section}>
            <Text style={styles.sectionTitle}>Grading Information</Text>
            
            <Input
              label="Grade"
              placeholder="e.g., MS70, AU58"
              value={form.grade}
              onChangeText={(text) => setForm(prev => ({ ...prev, grade: text }))}
              style={styles.input}
            />

            <Input
              label="Grader"
              placeholder="e.g., PCGS, NGC, ANACS"
              value={form.grader}
              onChangeText={(text) => setForm(prev => ({ ...prev, grader: text }))}
              style={styles.input}
            />

            <Input
              label="Certification Number"
              placeholder="e.g., 12345678"
              value={form.cert_number}
              onChangeText={(text) => setForm(prev => ({ ...prev, cert_number: text }))}
              style={styles.input}
            />

            <Input
              label="Population URL"
              placeholder="https://..."
              value={form.population_url}
              onChangeText={(text) => setForm(prev => ({ ...prev, population_url: text }))}
              style={styles.input}
              autoCapitalize="none"
            />

            <Input
              label="Rarity Score"
              placeholder="e.g., 85"
              value={form.rarity_score}
              onChangeText={(text) => setForm(prev => ({ ...prev, rarity_score: text }))}
              style={styles.input}
              keyboardType="number-pad"
            />
          </Card>

          {/* Product Settings */}
          <Card elevation="e1" style={styles.section}>
            <Text style={styles.sectionTitle}>Product Settings</Text>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Active</Text>
              <Switch
                value={form.is_active}
                onValueChange={(value) => setForm(prev => ({ ...prev, is_active: value }))}
                trackColor={{ false: colors.silver, true: colors.gold }}
                thumbColor={form.is_active ? colors.white : colors.white}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Auction Item</Text>
              <Switch
                value={form.is_auction}
                onValueChange={(value) => setForm(prev => ({ ...prev, is_auction: value }))}
                trackColor={{ false: colors.silver, true: colors.gold }}
                thumbColor={form.is_auction ? colors.white : colors.white}
              />
            </View>
          </Card>

          {/* Discount Management */}
          <Card elevation="e1" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Discounts & Flash Sales</Text>
              <Button
                title="Add Discount"
                onPress={() => setShowDiscountForm(true)}
                variant="outline"
                size="small"
              />
            </View>

            {discounts.length > 0 ? (
              <View style={styles.discountsList}>
                {discounts.map((discount) => {
                  const basePrice = parseFloat(form.price) || 0;
                  const salePrice = calculateSalePrice(basePrice, discount.type, discount.value);
                  const percentOff = calculatePercentOff(basePrice, salePrice);
                  
                  return (
                    <View key={discount.id} style={styles.discountCard}>
                      <View style={styles.discountInfo}>
                        <View style={styles.discountHeader}>
                          <Text style={styles.discountType}>
                            {discount.type === 'PERCENT' ? 'Percentage' : 'Amount'} Discount
                          </Text>
                          <View style={styles.discountBadges}>
                            {discount.is_featured && (
                              <View style={styles.featuredBadge}>
                                <Text style={styles.featuredBadgeText}>Featured</Text>
                              </View>
                            )}
                            <View style={[styles.statusBadge, { backgroundColor: discount.active ? colors.success : colors.textSecondary }]}>
                              <Text style={styles.statusBadgeText}>
                                {discount.active ? 'Active' : 'Inactive'}
                              </Text>
                            </View>
                          </View>
                        </View>
                        
                        <Text style={styles.discountValue}>
                          {discount.type === 'PERCENT' ? `${discount.value}%` : `$${discount.value}`}
                        </Text>
                        
                        <Text style={styles.discountPreview}>
                          ${basePrice.toFixed(2)} → ${salePrice.toFixed(2)} ({percentOff}% off)
                        </Text>
                        
                        <Text style={styles.discountDates}>
                          {new Date(discount.starts_at).toLocaleDateString()} - {new Date(discount.ends_at).toLocaleDateString()}
                        </Text>
                      </View>
                      
                      <View style={styles.discountActions}>
                        <TouchableOpacity
                          style={styles.discountActionButton}
                          onPress={() => handleEditDiscount(discount)}
                        >
                          <Ionicons name="pencil" size={16} color={colors.navy} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.discountActionButton}
                          onPress={() => handleDeleteDiscount(discount.id)}
                        >
                          <Ionicons name="trash" size={16} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noDiscountsText}>No discounts configured for this product</Text>
            )}
          </Card>

          {/* Discount Form Modal */}
          <Modal
            visible={showDiscountForm}
            transparent={true}
            animationType="slide"
            onRequestClose={() => {
              setShowDiscountForm(false);
              setEditingDiscount(null);
            }}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingDiscount ? 'Edit Discount' : 'Add Discount'}
                  </Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => {
                      setShowDiscountForm(false);
                      setEditingDiscount(null);
                      setDiscountForm({
                        type: 'PERCENT',
                        value: '',
                        starts_at: '',
                        ends_at: '',
                        is_featured: false,
                        active: true,
                      });
                    }}
                  >
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Discount Type</Text>
                    <View style={styles.radioGroup}>
                      <TouchableOpacity
                        style={[styles.radioOption, discountForm.type === 'PERCENT' && styles.radioOptionSelected]}
                        onPress={() => setDiscountForm(prev => ({ ...prev, type: 'PERCENT' }))}
                      >
                        <Text style={[styles.radioText, discountForm.type === 'PERCENT' && styles.radioTextSelected]}>
                          Percentage
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.radioOption, discountForm.type === 'AMOUNT' && styles.radioOptionSelected]}
                        onPress={() => setDiscountForm(prev => ({ ...prev, type: 'AMOUNT' }))}
                      >
                        <Text style={[styles.radioText, discountForm.type === 'AMOUNT' && styles.radioTextSelected]}>
                          Amount
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Input
                    label="Discount Value"
                    placeholder={discountForm.type === 'PERCENT' ? 'e.g., 20' : 'e.g., 50.00'}
                    value={discountForm.value}
                    onChangeText={(text) => setDiscountForm(prev => ({ ...prev, value: text }))}
                    keyboardType="numeric"
                  />

                         <DatePicker
                           label="Start Date"
                           placeholder="Select start date"
                           value={discountForm.starts_at}
                           onChangeText={(text) => setDiscountForm(prev => ({ ...prev, starts_at: text }))}
                           minimumDate={new Date()}
                         />

                         <DatePicker
                           label="End Date"
                           placeholder="Select end date"
                           value={discountForm.ends_at}
                           onChangeText={(text) => setDiscountForm(prev => ({ ...prev, ends_at: text }))}
                           minimumDate={discountForm.starts_at ? new Date(discountForm.starts_at) : new Date()}
                         />

                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Feature on Landing Page</Text>
                    <Switch
                      value={discountForm.is_featured}
                      onValueChange={(value) => setDiscountForm(prev => ({ ...prev, is_featured: value }))}
                      trackColor={{ false: colors.platinum, true: colors.navy }}
                      thumbColor={discountForm.is_featured ? colors.white : colors.white}
                    />
                  </View>

                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Active</Text>
                    <Switch
                      value={discountForm.active}
                      onValueChange={(value) => setDiscountForm(prev => ({ ...prev, active: value }))}
                      trackColor={{ false: colors.platinum, true: colors.navy }}
                      thumbColor={discountForm.active ? colors.white : colors.white}
                    />
                  </View>

                  {discountForm.value && form.price && (
                    <View style={styles.previewCard}>
                      <Text style={styles.previewTitle}>Price Preview</Text>
                      <Text style={styles.previewText}>
                        Original: ${parseFloat(form.price).toFixed(2)}
                      </Text>
                      <Text style={styles.previewText}>
                        Sale: ${calculateSalePrice(parseFloat(form.price), discountForm.type, parseFloat(discountForm.value) || 0).toFixed(2)}
                      </Text>
                      <Text style={styles.previewText}>
                        Savings: {calculatePercentOff(parseFloat(form.price), calculateSalePrice(parseFloat(form.price), discountForm.type, parseFloat(discountForm.value) || 0))}%
                      </Text>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setShowDiscountForm(false);
                      setEditingDiscount(null);
                    }}
                    variant="outline"
                  />
                  <Button
                    title={editingDiscount ? 'Update' : 'Create'}
                    onPress={handleDiscountSubmit}
                    disabled={!discountForm.value || !discountForm.starts_at || !discountForm.ends_at}
                  />
                </View>
              </View>
            </View>
          </Modal>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Delete"
              onPress={handleDelete}
              variant="outline"
              style={styles.deleteButton}
              disabled={isLoading}
              textStyle={{ color: colors.danger }}
            />
            <Button
              title={isLoading ? 'Updating...' : 'Update Product'}
              onPress={handleUpdate}
              style={styles.updateButton}
              disabled={isLoading}
              loading={isLoading}
            />
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    fontSize: typography.body.size,
    color: colors.danger,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.l,
  },
  section: {
    marginBottom: spacing.l,
    padding: spacing.l,
  },
  sectionTitle: {
    fontSize: typography.heading.size,
    fontWeight: typography.heading.weight,
    color: colors.text,
    marginBottom: spacing.m,
  },
  imagePickerContainer: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: 200,
    height: 250,
    borderRadius: radius.md,
    backgroundColor: colors.platinum,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11, 27, 43, 0.8)',
    padding: spacing.s,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  imageOverlayText: {
    fontSize: typography.caption.size,
    color: colors.white,
    textAlign: 'center',
    fontWeight: typography.heading.weight,
  },
  imagePlaceholder: {
    width: 200,
    height: 250,
    borderRadius: radius.md,
    backgroundColor: colors.platinum,
    borderWidth: 2,
    borderColor: colors.silver,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
    marginTop: spacing.s,
  },
  input: {
    marginBottom: spacing.m,
    minHeight: 44,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.m,
    paddingVertical: spacing.xl,
  },
  deleteButton: {
    flex: 1,
    minHeight: 44,
    borderColor: colors.danger,
  },
  updateButton: {
    flex: 2,
    minHeight: 44,
  },
  inputLabel: {
    fontSize: typography.caption.size,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
  },
  switchLabel: {
    fontSize: typography.body.size,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  warningCard: {
    backgroundColor: colors.orange + '10',
    borderColor: colors.orange,
    borderWidth: 1,
    marginBottom: spacing.m,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.s,
  },
  warningText: {
    fontSize: typography.body.size,
    color: colors.orange,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.s,
    flex: 1,
  },
  
  // Discount Management Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  discountsList: {
    gap: spacing.m,
  },
  discountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.platinum,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.silver,
  },
  discountInfo: {
    flex: 1,
    marginRight: spacing.m,
  },
  discountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  discountType: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
  },
  discountBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  featuredBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  featuredBadgeText: {
    fontSize: typography.caption.size,
    fontWeight: typography.weights.bold,
    color: colors.ivory,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  statusBadgeText: {
    fontSize: typography.caption.size,
    fontWeight: typography.weights.semibold,
    color: colors.ivory,
  },
  discountValue: {
    fontSize: typography.heading.size,
    fontWeight: typography.heading.weight,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  discountPreview: {
    fontSize: typography.caption.size,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  discountDates: {
    fontSize: typography.caption.size,
    color: colors.textTertiary,
  },
  discountActions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  discountActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ivory,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.silver,
  },
  noDiscountsText: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: spacing.l,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  modalContent: {
    backgroundColor: colors.ivory,
    borderRadius: radius.lg,
    width: '90%',
    maxHeight: '80%',
    ...shadows.e3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  modalTitle: {
    fontSize: typography.title.size,
    fontWeight: typography.title.weight,
    color: colors.navy,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.platinum,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: spacing.l,
    maxHeight: 400,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.m,
    padding: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.silver,
  },
  
  // Form Styles
  formRow: {
    marginBottom: spacing.m,
  },
  formLabel: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.medium,
    color: colors.navy,
    marginBottom: spacing.s,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  radioOption: {
    flex: 1,
    padding: spacing.m,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.silver,
    alignItems: 'center',
  },
  radioOptionSelected: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  radioText: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
  },
  radioTextSelected: {
    color: colors.ivory,
    fontWeight: typography.weights.semibold,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  switchLabel: {
    fontSize: typography.body.size,
    color: colors.navy,
  },
  previewCard: {
    backgroundColor: colors.platinum,
    padding: spacing.m,
    borderRadius: radius.md,
    marginTop: spacing.m,
  },
  previewTitle: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
    marginBottom: spacing.s,
  },
  previewText: {
    fontSize: typography.caption.size,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});


