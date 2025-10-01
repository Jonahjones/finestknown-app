import { AppHeader } from '@/src/components/AppHeader';
import { colors, spacing } from '@/src/design/tokens';
import { analytics } from '@/src/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Resource categories based on the Finest Known website
const RESOURCE_CATEGORIES = [
  {
    id: 'finest-known-resources',
    title: 'FINEST KNOWN RESOURCES',
    items: [
      { id: 'about', title: 'About', route: '/resources/about' },
      { id: 'rare-coin-news', title: 'Rare Coin News', route: '/resources/rare-coin-news' },
      { id: 'special-reports', title: 'Special Reports', route: '/resources/special-reports' },
      { id: 'videos', title: 'Videos', route: '/resources/videos' },
    ]
  },
  {
    id: 'collector-resources',
    title: 'COLLECTOR RESOURCES',
    items: [
      { id: 'goldbacks', title: 'What are Goldbacks?', route: '/resources/goldbacks' },
      { id: 'treasure-talk', title: 'Treasure Talk', route: '/resources/treasure-talk' },
      { id: 'double-eagles', title: 'Double Eagles', route: '/resources/double-eagles' },
      { id: 'caesar-gold-coins', title: '12 Caesar\'s Gold Coins', route: '/resources/caesar-gold-coins' },
      { id: 'morgan-silver-dollars', title: 'Morgan Silver Dollars', route: '/resources/morgan-silver-dollars' },
    ]
  }
];

export default function ResourcesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleResourcePress = (route: string) => {
    analytics.track('resource_viewed', { resource: route });
    router.push(route as any);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    analytics.track('search_performed', { query });
  };

  const filteredResources = RESOURCE_CATEGORIES.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const renderResourceItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.resourceItem}
      onPress={() => handleResourcePress(item.route)}
    >
      <View style={styles.resourceItemContent}>
        <Text style={styles.resourceItemTitle}>{item.title}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.gold} />
      </View>
    </TouchableOpacity>
  );

  const renderResourceCategory = ({ item }: { item: any }) => (
    <View style={styles.resourceCategory}>
      <Text style={styles.resourceCategoryTitle}>{item.title}</Text>
      <FlatList
        data={item.items}
        renderItem={renderResourceItem}
        keyExtractor={(resourceItem) => resourceItem.id}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Resources" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search resources..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        {/* Resources List */}
        <View style={styles.resourcesContainer}>
          <FlatList
            data={filteredResources}
            renderItem={renderResourceCategory}
            keyExtractor={(category) => category.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ivory,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  resourcesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  resourceCategory: {
    marginBottom: spacing.xl,
  },
  resourceCategoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  resourceItem: {
    backgroundColor: colors.ivory,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  resourceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  resourceItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
});