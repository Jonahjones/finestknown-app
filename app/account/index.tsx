import { Button, Card } from '@/src/components/ui';
import { colors, radius, shadows, spacing, typography } from '@/src/design/tokens';
import { useAuth } from '@/src/store/AuthContext';
import { analytics } from '@/src/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function AccountScreen() {
  const { user, signOut } = useAuth();

  React.useEffect(() => {
    analytics.screen('account');
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleOrdersPress = () => {
    router.push('/account/orders');
  };

  const getUserInitials = () => {
    if (!user?.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={[colors.navy, colors.navy + 'E6']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.cardBackground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Account</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => {/* Settings functionality */}}
          >
            <Ionicons name="settings-outline" size={24} color={colors.cardBackground} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Profile Card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={[colors.gold + '20', colors.gold + '10']}
            style={styles.profileGradient}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getUserInitials()}</Text>
                </View>
                <View style={styles.avatarBadge}>
                  <Ionicons name="diamond" size={12} color={colors.gold} />
                </View>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.email?.split('@')[0] || 'User'}
                </Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <View style={styles.memberBadge}>
                  <Ionicons name="star" size={14} color={colors.gold} />
                  <Text style={styles.memberText}>Finest Known Member</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleOrdersPress}
              activeOpacity={0.7}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="receipt-outline" size={28} color={colors.navy} />
              </View>
              <Text style={styles.quickActionTitle}>Orders</Text>
              <Text style={styles.quickActionSubtitle}>Track & view</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/cart')}
              activeOpacity={0.7}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="cart-outline" size={28} color={colors.navy} />
              </View>
              <Text style={styles.quickActionTitle}>Cart</Text>
              <Text style={styles.quickActionSubtitle}>View items</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/catalog')}
              activeOpacity={0.7}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="diamond-outline" size={28} color={colors.navy} />
              </View>
              <Text style={styles.quickActionTitle}>Shop</Text>
              <Text style={styles.quickActionSubtitle}>Browse items</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => {/* Wishlist functionality */}}
              activeOpacity={0.7}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="heart-outline" size={28} color={colors.navy} />
              </View>
              <Text style={styles.quickActionTitle}>Wishlist</Text>
              <Text style={styles.quickActionSubtitle}>Saved items</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Details */}
        <Card elevation="e2" style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Ionicons name="person-circle-outline" size={24} color={colors.navy} />
            <Text style={styles.detailsTitle}>Account Details</Text>
          </View>
          
          <View style={styles.detailsContent}>
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.detailLabel}>Email Address</Text>
              </View>
              <Text style={styles.detailValue} selectable>
                {user?.email || 'Not available'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="finger-print-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.detailLabel}>User ID</Text>
              </View>
              <Text style={styles.detailValue} selectable>
                {user?.id ? user.id.substring(0, 8) + '...' : 'Not available'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.detailLabel}>Member Since</Text>
              </View>
              <Text style={styles.detailValue}>
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Not available'
                }
              </Text>
            </View>
          </View>
        </Card>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="ghost"
            size="large"
            style={styles.signOutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardBackground,
  },
  headerGradient: {
    paddingTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: colors.navy + '20',
  },
  headerTitle: {
    ...typography.title,
    color: colors.cardBackground,
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: colors.navy + '20',
  },
  scrollView: {
    flex: 1,
  },
  heroCard: {
    margin: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.e1,
  },
  profileGradient: {
    padding: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.cardBackground,
  },
  avatarText: {
    ...typography.title,
    color: colors.cardBackground,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.navy,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.heading,
    color: colors.navy,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  profileEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  memberText: {
    ...typography.caption,
    color: colors.gold,
    marginLeft: spacing.xs,
  },
  quickActionsSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.cardBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.ivory,
    ...shadows.e1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.ivory,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionTitle: {
    ...typography.body,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  quickActionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  detailsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.xl,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  detailsTitle: {
    ...typography.heading,
    color: colors.navy,
    marginLeft: spacing.sm,
  },
  detailsContent: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    flex: 2,
    textAlign: 'right',
  },
  signOutSection: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  signOutButton: {
    borderColor: colors.danger,
  },
});
