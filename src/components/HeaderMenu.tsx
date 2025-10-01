import { Card } from '@/src/components/ui';
import { colors, shadows, spacing, typography } from '@/src/design/tokens';
import { useIsAdmin } from '@/src/hooks/useIsAdmin';
import { useAuth } from '@/src/store/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    Modal,
    Pressable,
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
    route: '/cart',
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

interface HeaderMenuProps {
  style?: any;
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({ style }) => {
  console.log('🔍 HeaderMenu: Component rendering');
  const [isVisible, setIsVisible] = React.useState(false);
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading, error: isAdminError, refetch: refetchAdmin } = useIsAdmin();

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 HeaderMenu: Admin status:', { isAdmin, isAdminLoading, isAdminError });
  }, [isAdmin, isAdminLoading, isAdminError]);

  // Force refresh admin status when component mounts
  React.useEffect(() => {
    refetchAdmin();
  }, [refetchAdmin]);

  // Dynamic menu items based on admin status
  const menuItems = React.useMemo(() => {
    const items = [...MENU_ITEMS];
    
    console.log('🔍 HeaderMenu: Building menu items, isAdmin:', isAdmin);
    
    // Add admin item if user is admin
    if (isAdmin === true) {
      console.log('✅ HeaderMenu: Adding admin panel to menu');
      items.splice(0, 0, {
        id: 'admin',
        title: 'Admin Panel',
        icon: 'shield-outline',
        route: '/admin',
        description: 'Manage products',
      });
    } else {
      console.log('❌ HeaderMenu: Not adding admin panel, isAdmin:', isAdmin);
    }
    
    return items;
  }, [isAdmin]);

  const handleMenuPress = () => {
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleMenuItemPress = (item: MenuItem) => {
    setIsVisible(false);
    
    // Small delay to let modal close smoothly
    setTimeout(() => {
      if (item.route === '/support/contact') {
        // For now, show an alert since we don't have a contact screen
        Alert.alert(
          'Contact Us',
          'Email us at support@finestknown.com or call (555) 123-4567',
          [{ text: 'OK' }]
        );
      } else {
        router.push(item.route as any);
      }
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
            setIsVisible(false);
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
      <TouchableOpacity
        style={[styles.menuButton, style]}
        onPress={handleMenuPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Open menu"
        accessibilityRole="button"
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getUserInitials()}</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
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
                      </View>
                      <View style={styles.menuItemContent}>
                        <Text style={styles.menuItemTitle}>{item.title}</Text>
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
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
});
