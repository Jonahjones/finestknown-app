import { colors, radius, spacing, typography } from '@/src/design/tokens';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryPickerProps {
  selectedCategorySlug?: string;
  onCategorySelect: (category: Category) => void;
  categories: Category[];
  placeholder?: string;
  style?: any;
}

export function CategoryPicker({
  selectedCategorySlug,
  onCategorySelect,
  categories,
  placeholder = "Select category...",
  style,
}: CategoryPickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  const selectedCategory = categories.find(cat => cat.slug === selectedCategorySlug);
  
  const handleCategoryPress = (category: Category) => {
    onCategorySelect(category);
    setIsVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.picker, style]}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.pickerText,
          !selectedCategory && styles.placeholderText
        ]}>
          {selectedCategory ? selectedCategory.name : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable 
            style={styles.modalBackdrop} 
            onPress={() => setIsVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    selectedCategorySlug === item.slug && styles.selectedCategoryItem
                  ]}
                  onPress={() => handleCategoryPress(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryName,
                    selectedCategorySlug === item.slug && styles.selectedCategoryName
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={styles.categorySlug}>{item.slug}</Text>
                  {selectedCategorySlug === item.slug && (
                    <Ionicons name="checkmark" size={20} color={colors.navy} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.categoryList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.silver,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    minHeight: 44,
  },
  pickerText: {
    fontSize: typography.body.size,
    color: colors.text,
    flex: 1,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
  },
  modalTitle: {
    fontSize: typography.heading.size,
    fontWeight: typography.heading.weight,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.s,
  },
  categoryList: {
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
  },
  selectedCategoryItem: {
    backgroundColor: colors.platinum,
  },
  categoryName: {
    fontSize: typography.body.size,
    color: colors.text,
    flex: 1,
    fontWeight: typography.weights.medium,
  },
  selectedCategoryName: {
    color: colors.navy,
    fontWeight: typography.weights.semibold,
  },
  categorySlug: {
    fontSize: typography.caption.size,
    color: colors.textSecondary,
    marginRight: spacing.s,
  },
});




