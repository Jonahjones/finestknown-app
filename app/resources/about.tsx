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

const ABOUT_ARTICLES = [
  {
    id: '1',
    title: 'Finest Known: 25 Years of Numismatic Excellence',
    date: '30 Jul',
    excerpt: 'Since 1998, Finest Known has established itself as a premier destination for rare coins, ancient artifacts, and precious metals...',
    content: `Since 1998, Finest Known has established itself as a premier destination for rare coins, ancient artifacts, and precious metals. Our journey began with a simple mission: to provide collectors and investors with access to the finest quality numismatic treasures while maintaining the highest standards of authenticity and expertise.

## Our Founding Vision

Finest Known was founded on the principle that every collector deserves access to authentic, high-quality numismatic items. Our founders, recognizing the need for a trusted source in the rare coin market, set out to create a company that would prioritize customer education, authentication, and exceptional service.

Over the past 25 years, we have built a reputation for integrity, expertise, and unparalleled customer service that has made us a trusted partner for collectors worldwide.

## Our Expertise

Our team of certified numismatists and precious metals experts brings decades of combined experience in:
- Authentication and grading
- Market analysis and valuation
- Historical research and provenance
- Investment guidance and portfolio building
- Educational outreach and collector development

## Specializations

We specialize in several key areas of numismatics:
- Rare and ancient coins from all periods
- Gold and silver bullion products
- Certified graded coins from all major services
- Investment-grade precious metals
- Historical artifacts and documents
- Shipwreck treasure and recovered artifacts

## Our Commitment to Quality

Every item in our inventory undergoes rigorous authentication and quality assessment. We work only with the most reputable grading services and maintain strict standards for the items we offer. Our commitment to quality extends beyond the products themselves to every aspect of our customer service.

## Looking Forward

As we look to the future, Finest Known remains committed to innovation, education, and excellence. We continue to expand our offerings, enhance our services, and support the growing community of collectors and investors who trust us with their numismatic needs.

Our mission remains unchanged: to be the finest known source for rare coins, precious metals, and numismatic expertise in the world.`
  },
  {
    id: '2',
    title: 'The Finest Known Difference: Why Collectors Choose Us',
    date: '27 Jul',
    excerpt: 'What sets Finest Known apart in the competitive world of rare coin dealing? Our commitment to excellence in every aspect of our business...',
    content: `What sets Finest Known apart in the competitive world of rare coin dealing? Our commitment to excellence in every aspect of our business, from authentication to customer service, has made us the preferred choice for serious collectors and investors.

## Unmatched Authentication Expertise

Our team includes some of the most respected numismatists in the industry, with decades of combined experience in authentication and grading. We don't just sell coins – we understand them, their history, and their true value.

Every item in our inventory is carefully examined by our experts, ensuring that our customers receive only authentic, high-quality pieces. This commitment to authenticity has earned us the trust of collectors worldwide.

## Educational Focus

We believe that an educated collector is a successful collector. That's why we invest heavily in educational resources, including:
- Detailed product descriptions and historical context
- Market analysis and investment guidance
- Collector education programs and seminars
- Comprehensive research and provenance documentation
- Expert advice and consultation services

## Customer Service Excellence

Our customer service philosophy is simple: treat every customer as if they were our only customer. This means:
- Personal attention and expert guidance
- Transparent pricing and honest appraisals
- Flexible payment options and terms
- Comprehensive insurance and security
- Lifetime support and consultation

## Market Leadership

As industry leaders, we have access to the finest collections and most sought-after pieces. Our relationships with major collectors, estates, and institutions allow us to offer items that are simply not available elsewhere.

## Innovation and Technology

We embrace technology to enhance the collecting experience:
- High-resolution imaging and detailed descriptions
- Online inventory management and tracking
- Secure online transactions and payments
- Digital certificates and provenance records
- Mobile-friendly platforms and apps

## Community Building

We believe in building a community of collectors, not just selling products. Through our educational programs, collector events, and online forums, we foster connections between collectors and help build the next generation of numismatists.

## The Finest Known Promise

When you choose Finest Known, you're not just buying a coin – you're joining a community of passionate collectors and investors who share your appreciation for history, art, and the enduring value of precious metals.

Our promise to you: every transaction, every interaction, every moment of our relationship will reflect our commitment to excellence, integrity, and your success as a collector.`
  },
  {
    id: '3',
    title: 'Our Team: The Experts Behind Finest Known',
    date: '24 Jul',
    excerpt: 'Meet the numismatic experts who make Finest Known the premier destination for rare coins and precious metals...',
    content: `Meet the numismatic experts who make Finest Known the premier destination for rare coins and precious metals. Our team combines decades of experience with cutting-edge knowledge to provide our customers with unparalleled expertise and service.

## Leadership Team

Our leadership team brings together some of the most respected names in numismatics, each with their own area of specialization and expertise. From ancient coins to modern bullion, our team has the knowledge and experience to guide you through any collecting decision.

## Authentication Specialists

Our authentication team includes certified graders from all major grading services, ensuring that every item in our inventory meets the highest standards of authenticity and quality. Their expertise spans all major coin series and periods, from ancient Greek and Roman coins to modern commemoratives.

## Market Analysts

Our market analysis team provides insights into current trends, pricing, and investment opportunities. Their research and analysis help our customers make informed decisions about their collections and investments.

## Educational Coordinators

Our educational team develops and delivers programs designed to help collectors at all levels improve their knowledge and skills. From beginner workshops to advanced seminars, we provide learning opportunities for everyone.

## Customer Service Excellence

Our customer service team is trained not just in customer relations, but in numismatics as well. They understand the products we sell and can provide knowledgeable assistance with any questions or concerns.

## Research and Development

Our research team continuously works to improve our services and expand our knowledge base. They maintain relationships with museums, universities, and other institutions to stay current with the latest developments in numismatics.

## The Finest Known Advantage

When you work with Finest Known, you're not just working with salespeople – you're working with experts who share your passion for numismatics. Our team's knowledge, experience, and dedication to excellence ensure that you receive the best possible service and guidance.

We're proud of our team and confident that their expertise will enhance your collecting experience. Whether you're a beginner just starting out or an experienced collector looking for that special piece, our team is here to help you succeed.`
  }
];

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
    queryFn: () => listProducts({ limit: 8 }),
  });

  const renderArticle = ({ item }: { item: any }) => (
    <View style={styles.articleCard}>
      <View style={styles.articleHeader}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <Text style={styles.articleTitle}>{item.title}</Text>
      </View>
      <Text style={styles.articleExcerpt}>{item.excerpt}</Text>
      <TouchableOpacity style={styles.readMoreButton}>
        <Text style={styles.readMoreText}>Read More</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.gold} />
      </TouchableOpacity>
    </View>
  );

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

        <View style={styles.mainContent}>
          {/* Articles Section */}
          <View style={styles.articlesSection}>
            <FlatList
              data={ABOUT_ARTICLES}
              renderItem={renderArticle}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Sidebar */}
          <View style={styles.sidebar}>
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>OUR MISSION</Text>
              <Text style={styles.sidebarText}>
                To provide collectors and investors with access to the finest quality rare coins, 
                ancient coinage, and precious metals while maintaining the highest standards of 
                authenticity, expertise, and customer service.
              </Text>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>SPECIALIZATIONS</Text>
              <View style={styles.specializationList}>
                <Text style={styles.specializationItem}>• Rare and ancient coins</Text>
                <Text style={styles.specializationItem}>• Gold and silver bullion</Text>
                <Text style={styles.specializationItem}>• Certified graded coins</Text>
                <Text style={styles.specializationItem}>• Investment-grade metals</Text>
                <Text style={styles.specializationItem}>• Historical artifacts</Text>
                <Text style={styles.specializationItem}>• Shipwreck treasure</Text>
              </View>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>CONTACT INFO</Text>
              <View style={styles.contactList}>
                <Text style={styles.contactItem}>Website: finestknown.com</Text>
                <Text style={styles.contactItem}>Email: info@finestknown.com</Text>
                <Text style={styles.contactItem}>Phone: (555) 123-4567</Text>
                <Text style={styles.contactItem}>Hours: Mon-Fri 9AM-6PM</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Featured Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>FEATURED PRODUCTS</Text>
          <View style={styles.productsGrid}>
            <View style={styles.productColumn}>
              <Text style={styles.columnTitle}>LATEST</Text>
              <FlatList
                data={FEATURED_PRODUCTS.slice(0, 4)}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
            <View style={styles.productColumn}>
              <Text style={styles.columnTitle}>BEST SELLING</Text>
              <FlatList
                data={FEATURED_PRODUCTS.slice(0, 4)}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
            <View style={styles.productColumn}>
              <Text style={styles.columnTitle}>TOP RATED</Text>
              <FlatList
                data={FEATURED_PRODUCTS.slice(0, 3)}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
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
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  articlesSection: {
    flex: 2,
    marginRight: spacing.lg,
  },
  articleCard: {
    backgroundColor: colors.ivory,
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  dateBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ivory,
  },
  articleTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.navy,
    lineHeight: 24,
  },
  articleExcerpt: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gold,
  },
  sidebar: {
    flex: 1,
  },
  sidebarSection: {
    backgroundColor: colors.ivory,
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
  },
  sidebarText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  specializationList: {
    marginTop: spacing.sm,
  },
  specializationItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
    paddingVertical: 2,
  },
  contactList: {
    marginTop: spacing.sm,
  },
  contactItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
    paddingVertical: 2,
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
  },
  productsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productColumn: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
    paddingBottom: spacing.sm,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 16,
  },
  productRating: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
  },
});