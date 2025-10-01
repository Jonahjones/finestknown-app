import { AppHeader } from '@/src/components/AppHeader';
import { colors, spacing, typography } from '@/src/design/tokens';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Sample article data - in a real app, this would come from an API
const articles = {
  '1': {
    id: '1',
    title: 'The Future of Gold: Market Trends and Predictions',
    content: `Gold has long been considered a safe haven investment, and as we look toward 2024, several key trends are emerging that could significantly impact gold prices and investment strategies.

## Current Market Conditions

The gold market has shown remarkable resilience in recent years, with prices maintaining strength despite economic uncertainties. Several factors are contributing to this trend:

- **Central Bank Policies**: Many central banks continue to maintain accommodative monetary policies, which historically supports gold prices.
- **Inflation Concerns**: Rising inflation rates make gold an attractive hedge against currency devaluation.
- **Geopolitical Tensions**: Ongoing global tensions increase demand for safe-haven assets like gold.

## Expert Predictions for 2024

Leading analysts are predicting several key developments:

### Price Targets
Most analysts expect gold to trade between $1,800 and $2,200 per ounce in 2024, with some optimistic forecasts reaching $2,500.

### Key Catalysts
1. **Federal Reserve Policy**: Interest rate decisions will be crucial
2. **Dollar Strength**: A weaker dollar typically supports gold prices
3. **Mining Supply**: Production constraints could support higher prices

## Investment Strategies

For investors looking to capitalize on gold's potential in 2024:

- **Physical Gold**: Consider coins and bars for direct ownership
- **ETFs**: Gold-backed ETFs offer liquidity and convenience
- **Mining Stocks**: Companies with strong balance sheets may outperform

## Risk Factors

While the outlook is generally positive, investors should be aware of:

- Interest rate increases could pressure gold prices
- Strong economic growth might reduce safe-haven demand
- Cryptocurrency competition for alternative investments

## Conclusion

The gold market in 2024 presents both opportunities and challenges. Investors should maintain a diversified approach and consider their risk tolerance when allocating to precious metals.`,
    category: 'Market Analysis',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80',
    publishedAt: '2024-01-15',
    author: 'Dr. Sarah Johnson',
    authorTitle: 'Senior Market Analyst',
  },
  '2': {
    id: '2',
    title: 'Silver Investment Strategies for Beginners',
    content: `Silver offers an excellent entry point for new precious metals investors. Often called 'poor man\'s gold,' silver provides many of the same benefits as gold at a more accessible price point.

## Why Invest in Silver?

Silver has unique characteristics that make it attractive to investors:

- **Industrial Demand**: Silver is used in electronics, solar panels, and medical devices
- **Affordability**: Lower price point allows for smaller initial investments
- **Volatility**: Higher volatility can create more trading opportunities
- **Historical Performance**: Long-term appreciation potential

## Getting Started

### 1. Set Your Investment Goals
- Determine your investment timeline
- Assess your risk tolerance
- Set a budget for precious metals allocation

### 2. Choose Your Investment Method
- **Physical Silver**: Coins, bars, and rounds
- **Silver ETFs**: Exchange-traded funds
- **Mining Stocks**: Silver mining companies
- **Silver IRAs**: Tax-advantaged retirement accounts

### 3. Start Small
Begin with a modest allocation, typically 5-10% of your portfolio, and gradually increase as you become more comfortable.

## Physical Silver Options

### Silver Coins
- American Silver Eagles
- Canadian Maple Leafs
- Austrian Philharmonics
- Generic rounds

### Silver Bars
- 1 oz bars for small investors
- 10 oz bars for medium investments
- 100 oz bars for larger allocations

## Storage and Security

Proper storage is crucial for physical silver:
- Home safes for small amounts
- Bank safe deposit boxes
- Professional storage facilities
- Insurance considerations

## Market Timing

While timing the market is difficult, consider these factors:
- Dollar strength vs. weakness
- Interest rate environment
- Industrial demand trends
- Mining supply constraints

## Common Mistakes to Avoid

- Don\'t invest more than you can afford to lose
- Avoid high-premium products unless collecting
- Don\'t neglect storage and security
- Don\'t try to time the market perfectly

## Building Your Portfolio

Start with a foundation of physical silver, then consider adding:
- Silver ETFs for liquidity
- Mining stocks for leverage
- Silver futures for advanced strategies

## Conclusion

Silver investment can be an excellent way to diversify your portfolio and hedge against inflation. Start small, learn continuously, and build your precious metals allocation over time.`,
    category: 'Investment Guide',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80',
    publishedAt: '2024-01-12',
    author: 'Michael Chen',
    authorTitle: 'Precious Metals Advisor',
  },
  '3': {
    id: '3',
    title: 'Platinum vs Palladium: Which is the Better Investment?',
    content: `Both platinum and palladium are precious metals with unique investment characteristics. Understanding their differences is crucial for making informed investment decisions.

## Platinum Overview

Platinum is one of the rarest precious metals on Earth, with unique properties:

- **Rarity**: 30 times rarer than gold
- **Industrial Uses**: Catalytic converters, jewelry, electronics
- **Price History**: Historically traded at a premium to gold
- **Supply**: Concentrated in South Africa and Russia

## Palladium Overview

Palladium has gained significant attention in recent years:

- **Industrial Demand**: Primarily used in automotive catalytic converters
- **Price Performance**: Outperformed other precious metals recently
- **Supply Constraints**: Limited mining production
- **Geographic Concentration**: Russia and South Africa dominate supply

## Key Differences

### Price Volatility
- **Platinum**: Generally more stable, longer-term trends
- **Palladium**: Higher volatility, more dramatic price swings

### Industrial Demand
- **Platinum**: Broader industrial applications
- **Palladium**: Heavily dependent on automotive sector

### Investment Accessibility
- **Platinum**: More established investment market
- **Palladium**: Growing but smaller investment market

## Investment Considerations

### When to Choose Platinum
- Seeking stability and long-term growth
- Want exposure to broader industrial demand
- Prefer established precious metals market
- Looking for diversification from gold/silver

### When to Choose Palladium
- Comfortable with higher volatility
- Believe in continued automotive demand
- Want exposure to supply constraints
- Seeking potential for higher returns

## Market Factors

### Economic Conditions
- **Recession**: Platinum typically outperforms
- **Growth**: Palladium may benefit from auto demand
- **Inflation**: Both can serve as hedges

### Supply and Demand
- **Platinum**: More stable supply, diverse demand
- **Palladium**: Supply constraints, concentrated demand

## Portfolio Allocation

Consider these strategies:

### Conservative Approach
- 60% platinum, 40% palladium
- Focus on stability and diversification

### Aggressive Approach
- 40% platinum, 60% palladium
- Emphasize growth potential

### Balanced Approach
- 50% platinum, 50% palladium
- Equal exposure to both metals

## Risk Factors

### Platinum Risks
- Declining automotive demand
- Substitution by palladium
- Economic downturns

### Palladium Risks
- Over-dependence on auto sector
- Price volatility
- Supply disruptions

## Investment Vehicles

### Physical Metals
- Platinum coins and bars
- Palladium coins and bars
- Storage and insurance considerations

### ETFs and Funds
- Platinum ETFs
- Palladium ETFs
- Precious metals mutual funds

### Mining Stocks
- Platinum mining companies
- Palladium mining companies
- Diversified precious metals miners

## Conclusion

Both platinum and palladium offer unique investment opportunities. Platinum provides stability and diversification, while palladium offers growth potential and volatility. The best choice depends on your risk tolerance, investment timeline, and market outlook. Consider a diversified approach that includes both metals to capture the benefits of each.`,
    category: 'Comparison',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80',
    publishedAt: '2024-01-10',
    author: 'Dr. Robert Martinez',
    authorTitle: 'Metals Market Specialist',
  },
  '4': {
    id: '4',
    title: 'Understanding Precious Metals Purity Standards',
    content: `Understanding purity standards is essential for any precious metals investor. These standards ensure quality, authenticity, and value consistency across the market.

## What Are Purity Standards?

Purity standards define the minimum percentage of precious metal content in coins, bars, and other products. They ensure that when you buy a 1-ounce gold coin, you're actually getting 1 ounce of pure gold.

## Gold Purity Standards

### 24 Karat (24K) - 99.9% Pure
- Highest purity available
- Soft and malleable
- Used for investment bars and some coins
- Most expensive per ounce

### 22 Karat (22K) - 91.7% Pure
- Common for coins like American Gold Eagles
- Contains 8.3% copper and silver
- More durable than 24K
- Good balance of purity and durability

### 18 Karat (18K) - 75% Pure
- Common in jewelry
- Contains 25% other metals
- Very durable
- Less common for investment purposes

### 14 Karat (14K) - 58.3% Pure
- Primarily used in jewelry
- Contains 41.7% other metals
- Very durable
- Not typically used for investment

## Silver Purity Standards

### .999 Fine Silver
- 99.9% pure silver
- Standard for investment bars
- Used in many bullion coins
- Highest purity available

### .925 Sterling Silver
- 92.5% pure silver
- 7.5% copper
- Standard for jewelry
- Used in some commemorative coins

### .900 Silver
- 90% pure silver
- 10% copper
- Used in older coins
- Still considered investment grade

## Platinum Purity Standards

### .9995 Fine Platinum
- 99.95% pure platinum
- Highest purity available
- Standard for investment bars
- Used in some coins

### .950 Platinum
- 95% pure platinum
- 5% other metals
- Used in some coins
- Good balance of purity and durability

## How Purity Affects Value

### Price Calculation
- Pure metal content determines value
- Higher purity = higher value per ounce
- Premiums may vary by purity level

### Example Calculation
- 1 oz .999 gold bar = 0.999 oz pure gold
- 1 oz .916 gold coin = 0.916 oz pure gold
- The .999 bar contains more pure gold

## Hallmarks and Assay Marks

### What They Mean
- Official stamps indicating purity
- Issued by recognized assay offices
- Provide authenticity guarantee
- Required in many countries

### Common Hallmarks
- **999**: 99.9% pure
- **916**: 91.6% pure (22K gold)
- **925**: 92.5% pure (sterling silver)
- **950**: 95% pure

## Investment Considerations

### For Gold
- 24K bars for maximum purity
- 22K coins for durability
- Consider premiums vs. purity

### For Silver
- .999 fine for investment
- .925 for some coins
- Check purity before buying

### For Platinum
- .9995 fine for investment
- .950 for some coins
- Verify assay marks

## Testing Purity

### Professional Testing
- X-ray fluorescence (XRF)
- Fire assay
- Acid testing
- Electronic testers

### Home Testing
- Magnet testing (gold/silver)
- Density testing
- Acid test kits
- Professional verification recommended

## Storage Considerations

### Pure Metals
- More susceptible to scratches
- Require careful handling
- May need protective packaging

### Alloyed Metals
- More durable
- Better for frequent handling
- May have different storage needs

## Conclusion

Understanding purity standards is crucial for making informed precious metals investments. Higher purity generally means higher value, but consider your specific needs, storage capabilities, and investment goals when choosing between different purity levels. Always verify purity through reputable dealers and consider professional testing for high-value purchases.`,
    category: 'Education',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80',
    publishedAt: '2024-01-08',
    author: 'Jennifer Walsh',
    authorTitle: 'Precious Metals Expert',
  },
};

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = articles[id as keyof typeof articles];

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Article Not Found" />
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>Article Not Found</Text>
          <Text style={styles.errorText}>The article you\'re looking for doesn\'t exist.</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Research" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Article Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: article.image }} style={styles.articleImage} />
        </View>

        {/* Article Content */}
        <View style={styles.content}>
          {/* Category and Read Time */}
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{article.category}</Text>
            </View>
            <Text style={styles.readTime}>{article.readTime}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Author Info */}
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{article.author}</Text>
            <Text style={styles.authorTitle}>{article.authorTitle}</Text>
            <Text style={styles.publishDate}>
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          {/* Article Content */}
          <Text style={styles.articleContent}>{article.content}</Text>
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
  imageContainer: {
    height: 250,
    backgroundColor: colors.platinum,
  },
  articleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  categoryText: {
    color: colors.cardBackground,
    fontSize: typography.caption.size,
    fontWeight: '600',
  },
  readTime: {
    color: colors.textSecondary,
    fontSize: typography.caption.size,
  },
  title: {
    fontSize: typography.display.size,
    fontWeight: typography.display.weight,
    color: colors.text,
    lineHeight: typography.display.lineHeight,
    marginBottom: spacing.lg,
  },
  authorRow: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  authorName: {
    fontSize: typography.body.size,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  authorTitle: {
    fontSize: typography.caption.size,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  publishDate: {
    fontSize: typography.caption.size,
    color: colors.textSecondary,
  },
  articleContent: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight * 1.6,
    color: colors.text,
    textAlign: 'left',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.title.size,
    fontWeight: typography.title.weight,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.cardBackground,
    fontSize: typography.body.size,
    fontWeight: '600',
  },
});







