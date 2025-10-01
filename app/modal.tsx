import { colors, radius, spacing, typography } from '@/src/design/tokens';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ModalScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Modal</Text>
        <Text style={styles.subtitle}>This is a modal screen</Text>
        
        <Link href="/" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
  },
  title: {
    fontSize: typography.title.size,
    fontWeight: typography.title.weight,
    color: colors.navy,
    marginBottom: spacing.s,
  },
  subtitle: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.navy,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radius.md,
  },
  buttonText: {
    fontSize: typography.body.size,
    color: colors.ivory,
  },
});