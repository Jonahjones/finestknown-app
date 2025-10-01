import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { useAuth } from '../store/AuthContext';
import { AuthScreen } from './AuthScreen';
import { FinestKnownLogo } from './FinestKnownLogo';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.ivory,
        paddingHorizontal: spacing.xl,
      }}>
        <FinestKnownLogo size="large" showText={true} />
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.gold,
          textAlign: 'center',
          marginTop: spacing.s,
          letterSpacing: 0.5,
        }}>Finestknown.com</Text>
        <View style={{ marginTop: spacing.xl }}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
}