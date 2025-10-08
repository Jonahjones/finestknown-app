import { listProducts } from '@/src/api/products';
import { AppHeader } from '@/src/components/AppHeader';
import {
  ResourcePageHeader,
  ResourceProductRow,
  ResourceSidebar,
  ResourceSidebarSection,
  ResourceSidebarText,
} from '@/src/components/resources';
import { colors, spacing } from '@/src/design/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutPage() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: latestData, isLoading: latestLoading, refetch } = useQuery({
    queryKey: ['about-latest-products'],
    queryFn: () => listProducts({ pageSize: 6, sort: 'newest' }),
  });

  const latestProducts = (latestData?.items || []) as any;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="About" />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand}
          />
        }
      >
        <ResourcePageHeader
          title="ABOUT FINEST KNOWN"
          description="Premier numismatic company specializing in rare coins, ancient coinage, and precious metals since 1998."
        />

        <View style={styles.mainContent}>
          {/* Content Section */}
          <View style={styles.contentSection}>
            <View style={styles.section}>
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>OUR EXPERTISE</Text>
              <Text style={styles.sectionText}>
                Our team of certified numismatists and precious metals experts brings decades of combined experience in:
              </Text>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
                  <Text style={styles.bulletText}>Authentication and grading</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
                  <Text style={styles.bulletText}>Market analysis and valuation</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
                  <Text style={styles.bulletText}>Historical research and provenance</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
                  <Text style={styles.bulletText}>Investment guidance and portfolio building</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
                  <Text style={styles.bulletText}>Educational outreach and collector development</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SPECIALIZATIONS</Text>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
                  <Text style={styles.bulletText}>Rare and ancient coins from all periods</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
                  <Text style={styles.bulletText}>Gold and silver bullion products</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
                  <Text style={styles.bulletText}>Certified graded coins from all major services</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
                  <Text style={styles.bulletText}>Investment-grade precious metals</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
                  <Text style={styles.bulletText}>Historical artifacts and documents</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
                  <Text style={styles.bulletText}>Shipwreck treasure and recovered artifacts</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CONTACT INFO</Text>
              <View style={styles.contactList}>
                <TouchableOpacity style={styles.contactItem}>
                  <Ionicons name="globe" size={18} color={colors.gold} />
                  <Text style={styles.contactText}>finestknown.com</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactItem}>
                  <Ionicons name="mail" size={18} color={colors.gold} />
                  <Text style={styles.contactText}>info@finestknown.com</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactItem}>
                  <Ionicons name="call" size={18} color={colors.gold} />
                  <Text style={styles.contactText}>(555) 123-4567</Text>
                </TouchableOpacity>
                <View style={styles.contactItem}>
                  <Ionicons name="time" size={18} color={colors.gold} />
                  <Text style={styles.contactText}>Mon-Fri 9AM-6PM EST</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Sidebar on larger screens */}
          <ResourceSidebar>
            <ResourceSidebarSection title="WHY CHOOSE US">
              <ResourceSidebarText>
                With over 25 years of experience, Finest Known has built a reputation for excellence 
                in the numismatic community. Our commitment to authenticity, expert knowledge, and 
                exceptional customer service makes us the trusted choice for collectors worldwide.
              </ResourceSidebarText>
            </ResourceSidebarSection>

            <ResourceSidebarSection title="CERTIFICATIONS">
              <View style={styles.certList}>
                <Text style={styles.certItem}>• PNG Member</Text>
                <Text style={styles.certItem}>• ANA Dealer</Text>
                <Text style={styles.certItem}>• PCGS Authorized</Text>
                <Text style={styles.certItem}>• NGC Dealer</Text>
              </View>
            </ResourceSidebarSection>
          </ResourceSidebar>
        </View>

        {/* Featured Products */}
        {latestProducts.length > 0 && (
          <View style={styles.productsSection}>
            <ResourceProductRow
              products={latestProducts}
              title="FEATURED PRODUCTS"
              isLoading={latestLoading}
            />
          </View>
        )}
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
  mainContent: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  contentSection: {
    flex: 2,
  },
  section: {
    backgroundColor: colors.ivory,
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  bulletList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  contactList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  contactText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  certList: {
    gap: spacing.xs,
  },
  certItem: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  productsSection: {
    backgroundColor: colors.ivory,
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
});