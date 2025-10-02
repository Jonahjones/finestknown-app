import { listProducts } from '@/src/api/products';
import { AppHeader } from '@/src/components/AppHeader';
import { colors, spacing } from '@/src/design/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FEATURED_PRODUCTS = [
  {
    id: '1',
    title: '1923 $20 GOLD ST. GAUDENS PCGS MS63',
    price: 4161.41,
    image: 'https://via.placeholder.com/100x100/FFD700/000000?text=1923+$20',
    rating: 5,
    category: 'Gold Coins'
  },
  {
    id: '2',
    title: 'Roman Empire AD 69 Otho Denarius NGC AU',
    price: 11000.00,
    image: 'https://via.placeholder.com/100x100/C0C0C0/000000?text=Roman',
    rating: 5,
    category: 'Ancient Coins'
  },
  {
    id: '3',
    title: '1 Utah Goldback Currency 1/1000 oz',
    price: 7.36,
    image: 'https://via.placeholder.com/100x60/FFD700/000000?text=1+UT',
    rating: 5,
    category: 'Goldbacks'
  },
  {
    id: '4',
    title: 'Morgan Silver Dollar 1881-CC PCGS MS65',
    price: 2500.00,
    image: 'https://via.placeholder.com/100x100/C0C0C0/000000?text=Morgan',
    rating: 5,
    category: 'Silver Coins'
  }
];

export default function AboutPage() {
  const { data: products } = useQuery({
    queryKey: ['about-products'],
    queryFn: () => listProducts({ pageSize: 8 }),
  });

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.productRating}>
          {[...Array(5)].map((_, i) => (
            <Ionicons key={i} name="star" size={12} color={colors.gold} />
          ))}
        </View>
        <Text style={styles.productPrice}>${item.price.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="About" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>ABOUT FINEST KNOWN</Text>
          <Text style={styles.pageDescription}>
            Premier numismatic company specializing in rare coins, ancient coinage, and precious metals since 1998. 
            Discover our story, our expertise, and our commitment to excellence.
          </Text>
        </View>

        {/* Main Content Sections */}
        <View style={styles.mainContent}>
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>OUR MISSION</Text>
            <Text style={styles.sectionText}>
              To provide collectors and investors with access to the finest quality rare coins, 
              ancient coinage, and precious metals while maintaining the highest standards of 
              authenticity, expertise, and customer service.
            </Text>
            <Text style={styles.sectionText}>
              Since 1998, Finest Known has established itself as a premier destination for rare coins, 
              ancient artifacts, and precious metals. Our journey began with a simple mission: to provide 
              collectors and investors with access to the finest quality numismatic treasures while maintaining 
              the highest standards of authenticity and expertise.
            </Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>OUR EXPERTISE</Text>
            <Text style={styles.sectionText}>
              Our team of certified numismatists and precious metals experts brings decades of combined experience in:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Authentication and grading</Text>
              <Text style={styles.bulletItem}>• Market analysis and valuation</Text>
              <Text style={styles.bulletItem}>• Historical research and provenance</Text>
              <Text style={styles.bulletItem}>• Investment guidance and portfolio building</Text>
              <Text style={styles.bulletItem}>• Educational outreach and collector development</Text>
            </View>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>SPECIALIZATIONS</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Rare and ancient coins from all periods</Text>
              <Text style={styles.bulletItem}>• Gold and silver bullion products</Text>
              <Text style={styles.bulletItem}>• Certified graded coins from all major services</Text>
              <Text style={styles.bulletItem}>• Investment-grade precious metals</Text>
              <Text style={styles.bulletItem}>• Historical artifacts and documents</Text>
              <Text style={styles.bulletItem}>• Shipwreck treasure and recovered artifacts</Text>
            </View>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>CONTACT INFO</Text>
            <View style={styles.contactList}>
              <Text style={styles.contactItem}>Website: finestknown.com</Text>
              <Text style={styles.contactItem}>Email: info@finestknown.com</Text>
              <Text style={styles.contactItem}>Phone: (555) 123-4567</Text>
              <Text style={styles.contactItem}>Hours: Mon-Fri 9AM-6PM EST</Text>
            </View>
          </View>
        </View>

        {/* Featured Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>FEATURED PRODUCTS</Text>
          
          {/* Latest Row */}
          <View style={styles.productRow}>
            <Text style={styles.rowTitle}>LATEST</Text>
            <FlatList
              data={FEATURED_PRODUCTS}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productRowContent}
            />
          </View>

          {/* Best Selling Row */}
          <View style={styles.productRow}>
            <Text style={styles.rowTitle}>BEST SELLING</Text>
            <FlatList
              data={FEATURED_PRODUCTS}
              renderItem={renderProduct}
              keyExtractor={(item) => `best-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productRowContent}
            />
          </View>

          {/* Top Rated Row */}
          <View style={styles.productRow}>
            <Text style={styles.rowTitle}>TOP RATED</Text>
            <FlatList
              data={FEATURED_PRODUCTS.slice(0, 3)}
              renderItem={renderProduct}
              keyExtractor={(item) => `top-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productRowContent}
            />
          </View>
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
  },
  pageHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.ivory,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  pageDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  mainContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  contentSection: {
    backgroundColor: colors.ivory,
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
  },
  sectionText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  bulletList: {
    marginTop: spacing.sm,
  },
  bulletItem: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  contactList: {
    marginTop: spacing.sm,
  },
  contactItem: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  productsSection: {
    backgroundColor: colors.ivory,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
  productsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  productRow: {
    marginBottom: spacing.xl,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
    paddingBottom: spacing.sm,
  },
  productRowContent: {
    paddingHorizontal: spacing.lg,
  },
  productCard: {
    width: 280,
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 6,
    lineHeight: 18,
  },
  productRating: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
  },
});