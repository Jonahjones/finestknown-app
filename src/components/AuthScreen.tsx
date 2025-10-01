import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, shadows, spacing } from '../design/tokens';
import { useAuth } from '../store/AuthContext';
import { FinestKnownLogo } from './FinestKnownLogo';
import { Button, Card, Input } from './ui';

export const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    console.log('🔐 Auth attempt:', { isSignUp, email: email.substring(0, 3) + '***' });
    
    if (!email || !password) {
      console.log('❌ Missing credentials');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        console.log('📝 Attempting sign up...');
        await signUp(email, password);
        console.log('✅ Sign up completed');
        Alert.alert('Success', 'Account created! You can now sign in with your credentials.');
        // Switch to sign in mode after successful signup
        setIsSignUp(false);
      } else {
        console.log('🔑 Attempting sign in...');
        await signIn(email, password);
        console.log('✅ Sign in completed');
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      
      // Provide helpful suggestions based on the error
      if (errorMessage.includes('Network request failed')) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to our servers. Please check your internet connection and try again.'
        );
      } else if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('Invalid email')) {
        Alert.alert(
          'Invalid Credentials',
          'The email or password you entered is incorrect. Please check your credentials and try again.'
        );
      } else if (errorMessage.includes('User already registered')) {
        Alert.alert(
          'Account Exists',
          'An account with this email already exists. Please sign in instead or use a different email address.'
        );
      } else if (errorMessage.includes('Email not confirmed')) {
        Alert.alert(
          'Email Verification Required',
          'Please check your email and click the verification link before signing in.'
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo/Brand Section */}
          <View style={styles.brandSection}>
            <FinestKnownLogo size="large" showText={true} />
          </View>

          {/* Auth Card */}
          <Card elevation="e3" style={styles.authCard}>
            <View style={styles.cardContent}>
              {/* Header */}
              <View style={styles.authHeader}>
                <Text style={styles.authTitle}>
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </Text>
                <Text style={styles.authSubtitle}>
                  {isSignUp 
                    ? 'Join the finest precious metals community'
                    : 'Sign in to your account'
                  }
                </Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                <Input
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={styles.input}
                />
                
                <Input
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  style={styles.input}
                />

                {/* Primary Action Button */}
                <Button
                  title={loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                  onPress={handleAuth}
                  disabled={loading}
                  loading={loading}
                  variant="cta"
                  size="large"
                  style={styles.primaryButton}
                />

                {/* Google Sign In - Disabled for now */}
                {/* <Button
                  title="Continue with Google"
                  onPress={() => {}}
                  variant="secondary"
                  size="large"
                  style={styles.googleButton}
                  icon="logo-google"
                /> */}
              </View>

              {/* Switch Mode */}
              <View style={styles.switchMode}>
                <Text style={styles.switchText}>
                  {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsSignUp(!isSignUp)}
                  style={styles.switchButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.switchButtonText}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  
  // Brand Section
  brandSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl * 2,
  },
  logoContainer: {
    marginBottom: spacing.l,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.e2,
  },
  brandTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  websiteText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.gold,
    textAlign: 'center',
    marginTop: spacing.s,
    letterSpacing: 0.5,
  },
  
  // Auth Card
  authCard: {
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.platinum,
    marginBottom: spacing.xl,
  },
  cardContent: {
    padding: spacing.xxl,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  authTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Form
  form: {
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.l,
    minHeight: 48, // Accessibility target
  },
  primaryButton: {
    marginBottom: spacing.l,
    minHeight: 48, // Accessibility target
  },
  googleButton: {
    borderColor: colors.platinum,
    minHeight: 48, // Accessibility target
  },
  
  // Switch Mode
  switchMode: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  switchText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: colors.textSecondary,
    marginRight: spacing.s,
  },
  switchButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    minHeight: 44, // Accessibility target
    justifyContent: 'center',
  },
  switchButtonText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.navy,
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.l,
  },
  footerText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: colors.textTertiary,
    textAlign: 'center',
  },
});