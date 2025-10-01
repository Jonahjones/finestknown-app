import { adminCreateProduct, pickProductImage, uploadProductImage } from '@/src/api/admin';
import { AppHeader } from '@/src/components/AppHeader';
import { AuthWrapper } from '@/src/components/AuthWrapper';
import { CategoryPicker } from '@/src/components/CategoryPicker';
import { Button, Card, Input } from '@/src/components/ui';
import { colors, radius, spacing, typography } from '@/src/design/tokens';
import { useIsAdmin } from '@/src/hooks/useIsAdmin';
import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
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
  stock: string;
  description: string;
}

export default function AdminNewProductScreen() {
  const [form, setForm] = useState<ProductForm>({
    title: '',
    sku: '',
    category_primary: '',
    category_slug: '',
    price: '',
    stock: '',
    description: '',
  });
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

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

  const createProductMutation = useMutation({
    mutationFn: async () => {
      let photoUrls: string[] = [];
      
      // Upload image if selected
      if (selectedImageUri) {
        setIsUploading(true);
        try {
          const imageUrl = await uploadProductImage(selectedImageUri);
          photoUrls = [imageUrl];
        } catch (error) {
          console.error('Image upload failed:', error);
          throw new Error('Failed to upload product image');
        } finally {
          setIsUploading(false);
        }
      }

      // Create product
      const productData = {
        title: form.title.trim(),
        sku: form.sku.trim().toUpperCase(),
        category_primary: form.category_primary || undefined,
        price_cents: Math.round(parseFloat(form.price) * 100),
        stock: parseInt(form.stock),
        description: form.description.trim() || undefined,
        photos: photoUrls.length > 0 ? photoUrls : undefined,
      };

      return adminCreateProduct(productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      Alert.alert('Success', 'Product created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to create product');
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

  const handleSubmit = () => {
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

    createProductMutation.mutate();
  };

  const handleCategorySelect = (category: any) => {
    setForm(prev => ({
      ...prev,
      category_primary: category.id,
      category_slug: category.slug,
    }));
  };

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
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const isLoading = createProductMutation.isPending || isUploading;

  return (
    <AuthWrapper>
      <SafeAreaView style={styles.container}>
        <AppHeader title="New Product" />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Product Image */}
          <Card elevation="e1" style={styles.section}>
            <Text style={styles.sectionTitle}>Product Image</Text>
            <TouchableOpacity
              style={styles.imagePickerContainer}
              onPress={handleImagePick}
              disabled={isLoading}
            >
              {selectedImageUri ? (
                <Image source={{ uri: selectedImageUri }} style={styles.selectedImage} />
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
              label="Stock Quantity"
              placeholder="0"
              value={form.stock}
              onChangeText={(text) => setForm(prev => ({ ...prev, stock: text }))}
              style={styles.input}
              keyboardType="number-pad"
              required
            />
          </Card>

          {/* Description */}
          <Card elevation="e1" style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            
            <Input
              label="Product Description"
              placeholder="Detailed product description..."
              value={form.description}
              onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
              style={styles.textArea}
              multiline
              numberOfLines={4}
            />
          </Card>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
              style={styles.cancelButton}
              disabled={isLoading}
            />
            <Button
              title={isLoading ? 'Creating...' : 'Create Product'}
              onPress={handleSubmit}
              style={styles.submitButton}
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
  selectedImage: {
    width: 200,
    height: 250,
    borderRadius: radius.md,
    backgroundColor: colors.platinum,
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
  inputLabel: {
    fontSize: typography.caption.size,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.m,
    paddingVertical: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    minHeight: 44,
  },
  submitButton: {
    flex: 2,
    minHeight: 44,
  },
});


