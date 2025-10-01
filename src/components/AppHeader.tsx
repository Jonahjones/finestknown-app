import { listCartItems } from '@/src/api/cart';
import { fetchLivePrices } from '@/src/api/pricing';
import { FinestKnownLogo } from '@/src/components/FinestKnownLogo';
import { Card } from '@/src/components/ui';
import { colors, shadows, spacing, typography } from '@/src/design/tokens';
import { useIsAdmin } from '@/src/hooks/useIsAdmin';
import { useAuth } from '@/src/store/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  description?: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'account',
    title: 'Account',
    icon: 'person-outline',
    route: '/account',
    description: 'Profile and settings',
  },
  {
    id: 'orders',
    title: 'Orders',
    icon: 'receipt-outline',
    route: '/account/orders',
    description: 'Order history',
  },
  {
    id: 'cart',
    title: 'Cart',
    icon: 'cart-outline',
    route: '/(tabs)/cart',
    description: 'Shopping cart',
  },
  {
    id: 'contact',
    title: 'Contact Us',
    icon: 'mail-outline',
    route: '/support/contact',
    description: 'Get help and support',
  },
];

interface AppHeaderProps {
  title: string;
  style?: any;
  showLivePrices?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const AppHeader: React.FC<AppHeaderProps> = ({ title, style, showLivePrices = false }) => {
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const [currentPriceIndex, setCurrentPriceIndex] = React.useState(0);
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const scrollX = React.useRef(new Animated.Value(0)).current;

  // Get cart items to show count
  const { data: cartItems = [] } = useQuery({
    queryKey: ['cartItems'],
    queryFn: listCartItems,
    enabled: !!user,
  });

  // Get live prices for sliding display
  const { data: livePrices = [] } = useQuery({
    queryKey: ['livePrices'],
    queryFn: fetchLivePrices,
    enabled: showLivePrices,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

  // Auto-scroll live prices with continuous ticker scrolling
  React.useEffect(() => {
    if (!showLivePrices || livePrices.length === 0) return;

    let animationId: number;
    let startTime: number;
    const scrollSpeed = 50; // pixels per second
    const itemWidth = 120;
    const margin = 12;
    const totalItemWidth = itemWidth + margin;
    const totalWidth = livePrices.length * totalItemWidth;

    const animateScroll = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000; // Convert to seconds
      
      if (scrollViewRef.current) {
        // Continuous scroll position
        const scrollX = (elapsed * scrollSpeed) % totalWidth;
        
        scrollViewRef.current.scrollTo({
          x: scrollX,
          animated: false,
        });
        
        animationId = requestAnimationFrame(animateScroll);
      }
    };

    animationId = requestAnimationFrame(animateScroll);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [showLivePrices, livePrices.length]);

  // Dynamic menu items based on admin status
  const menuItems = React.useMemo(() => {
    console.log('🔍 AppHeader: Building menu items, isAdmin:', isAdmin);
    const items = [...MENU_ITEMS];
    
    // Add admin item if user is admin
    if (isAdmin === true) {
      console.log('✅ AppHeader: Adding admin panel to menu');
      items.splice(0, 0, {
        id: 'admin',
        title: 'Admin Panel',
        icon: 'shield-outline',
        route: '/admin',
        description: 'Manage products',
      });
    } else {
      console.log('❌ AppHeader: Not adding admin panel, isAdmin:', isAdmin);
    }
    
    return items;
  }, [isAdmin]);

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleClose = () => {
    setIsMenuVisible(false);
  };

  const handleMenuItemPress = (item: MenuItem) => {
    setIsMenuVisible(false);
    
    // Small delay to let modal close smoothly
    setTimeout(() => {
      router.push(item.route as any);
    }, 150);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsMenuVisible(false);
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getUserInitials = () => {
    if (!user?.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <>
      <View style={[styles.header, style]}>
        {/* Title or Live Prices */}
        {showLivePrices && livePrices.length > 0 ? (
          <View style={styles.livePricesContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled={false}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              bounces={false}
              scrollEventThrottle={1}
              removeClippedSubviews={false}
              style={styles.livePricesScroll}
            >
              <View style={styles.livePricesRow}>
                {/* First set of items */}
                {livePrices.map((price, index) => (
                  <View key={`${price.metal}-1`} style={styles.livePriceItem}>
                    <View style={styles.livePriceContent}>
                      <Ionicons 
                        name={
                          price.metal === 'Gold' ? 'medal' :
                          price.metal === 'Silver' ? 'medal-outline' :
                          price.metal === 'Platinum' ? 'trophy' :
                          price.metal === 'Palladium' ? 'trophy-outline' :
                          price.metal === 'Copper' ? 'flame' :
                          price.metal === 'Rhodium' ? 'diamond' :
                          'medal'
                        } 
                        size={16} 
                        color={
                          price.metal === 'Gold' ? '#FFD700' :
                          price.metal === 'Silver' ? '#C0C0C0' :
                          price.metal === 'Platinum' ? '#E5E4E2' :
                          price.metal === 'Palladium' ? '#B4B4B4' :
                          price.metal === 'Copper' ? '#B87333' :
                          price.metal === 'Rhodium' ? '#A0A0A0' :
                          colors.gold
                        } 
                      />
                      <Text style={styles.livePriceMetal}>{price.metal}</Text>
                      <Text style={styles.livePriceValue}>${price.price.toFixed(2)}</Text>
                    </View>
                  </View>
                ))}
                {/* Second set of items for seamless loop */}
                {livePrices.map((price, index) => (
                  <View key={`${price.metal}-2`} style={styles.livePriceItem}>
                    <View style={styles.livePriceContent}>
                      <Ionicons 
                        name={
                          price.metal === 'Gold' ? 'medal' :
                          price.metal === 'Silver' ? 'medal-outline' :
                          price.metal === 'Platinum' ? 'trophy' :
                          price.metal === 'Palladium' ? 'trophy-outline' :
                          price.metal === 'Copper' ? 'flame' :
                          price.metal === 'Rhodium' ? 'diamond' :
                          'medal'
                        } 
                        size={16} 
                        color={
                          price.metal === 'Gold' ? '#FFD700' :
                          price.metal === 'Silver' ? '#C0C0C0' :
                          price.metal === 'Platinum' ? '#E5E4E2' :
                          price.metal === 'Palladium' ? '#B4B4B4' :
                          price.metal === 'Copper' ? '#B87333' :
                          price.metal === 'Rhodium' ? '#A0A0A0' :
                          colors.gold
                        } 
                      />
                      <Text style={styles.livePriceMetal}>{price.metal}</Text>
                      <Text style={styles.livePriceValue}>${price.price.toFixed(2)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          <View style={styles.headerContent}>
            <FinestKnownLogo size="small" showText={false} />
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
        )}

        {/* Avatar with Menu Overlay */}
        <TouchableOpacity
          style={styles.avatarMenuButton}
          onPress={handleMenuPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Open profile menu"
          accessibilityRole="button"
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getUserInitials()}</Text>
          </View>
          {/* Menu icon overlay */}
          <View style={styles.menuOverlay}>
            <Ionicons name="menu" size={14} color={colors.ivory} />
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <View style={[styles.menuContainer, { paddingTop: insets.top + 60 }]}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <Card elevation="e3" style={styles.menuCard}>
                {/* User Info */}
                <View style={styles.userSection}>
                  <View style={styles.avatarLarge}>
                    <Text style={styles.avatarTextLarge}>{getUserInitials()}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {user?.email || 'Guest User'}
                    </Text>
                    <Text style={styles.userStatus}>Finest Known Member</Text>
                  </View>
                </View>

                 {/* Menu Items */}
                 <View style={styles.menuItems}>
                   {menuItems.map((item) => (
                     <TouchableOpacity
                       key={item.id}
                       style={styles.menuItem}
                       onPress={() => handleMenuItemPress(item)}
                       activeOpacity={0.7}
                     >
                       <View style={styles.menuItemIcon}>
                         <Ionicons 
                           name={item.icon} 
                           size={24} 
                           color={colors.navy} 
                         />
                         {item.id === 'cart' && cartItemCount > 0 && (
                           <View style={styles.cartBadge}>
                             <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                           </View>
                         )}
                       </View>
                       <View style={styles.menuItemContent}>
                         <Text style={styles.menuItemTitle}>
                           {item.title}
                           {item.id === 'cart' && cartItemCount > 0 && ` (${cartItemCount})`}
                         </Text>
                         {item.description && (
                           <Text style={styles.menuItemDescription}>
                             {item.description}
                           </Text>
                         )}
                       </View>
                       <Ionicons 
                         name="chevron-forward" 
                         size={20} 
                         color={colors.textTertiary} 
                       />
                     </TouchableOpacity>
                   ))}
                 </View>

                {/* Sign Out */}
                <View style={styles.signOutSection}>
                  <TouchableOpacity
                    style={styles.signOutButton}
                    onPress={handleSignOut}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="log-out-outline" 
                      size={24} 
                      color={colors.danger} 
                    />
                    <Text style={styles.signOutText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.l,
    backgroundColor: colors.ivory,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
    ...shadows.e1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.title.size,
    lineHeight: typography.title.lineHeight,
    fontWeight: typography.title.weight,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginLeft: 12,
  },
  avatarMenuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    position: 'relative',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.e1,
  },
  avatarText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
    color: colors.ivory,
  },
  menuOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.ivory,
    ...shadows.e1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    paddingHorizontal: spacing.l,
    paddingRight: spacing.l,
    width: '100%',
    maxWidth: 320,
  },
  menuCard: {
    backgroundColor: colors.ivory,
    minWidth: 280,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.l,
    ...shadows.e1,
  },
  avatarTextLarge: {
    fontSize: typography.title.size,
    fontWeight: typography.title.weight,
    color: colors.ivory,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userStatus: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.caption.weight,
    color: colors.textSecondary,
  },
  menuItems: {
    paddingVertical: spacing.m,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.xl,
    minHeight: 56, // Accessibility target
  },
  menuItemIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: spacing.l,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  menuItemDescription: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.caption.weight,
    color: colors.textSecondary,
  },
  signOutSection: {
    borderTopWidth: 1,
    borderTopColor: colors.platinum,
    padding: spacing.l,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.l,
    minHeight: 48, // Accessibility target
  },
  signOutText: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.medium,
    color: colors.danger,
    marginLeft: spacing.m,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.ivory,
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.ivory,
  },
  // Live Prices Styles
  livePricesContainer: {
    flex: 1,
    height: 40,
    marginRight: spacing.l,
  },
  livePricesScroll: {
    flex: 1,
  },
  livePricesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  livePriceItem: {
    marginRight: 12, // Consistent spacing between items
  },
  livePriceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 12,
    ...shadows.e1,
  },
  livePriceMetal: {
    fontSize: typography.caption.size,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginLeft: spacing.xs,
    marginRight: spacing.sm,
  },
  livePriceValue: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.bold,
    color: colors.navy,
  },
});
