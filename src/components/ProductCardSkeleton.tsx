import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, radii, shadow, spacing } from '../theme';

export function ProductCardSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Image skeleton */}
        <Animated.View style={[styles.image, { opacity }]} />
        
        {/* Content skeleton */}
        <View style={styles.content}>
          <Animated.View style={[styles.titleLine1, { opacity }]} />
          <Animated.View style={[styles.titleLine2, { opacity }]} />
          <Animated.View style={[styles.priceLine, { opacity }]} />
          <Animated.View style={[styles.stockLine, { opacity }]} />
          <Animated.View style={[styles.buttonLine, { opacity }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    overflow: 'hidden',
    padding: spacing.md,
    ...shadow.card,
  },
  image: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: colors.border,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  content: {
    gap: spacing.xs,
  },
  titleLine1: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '100%',
  },
  titleLine2: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '60%',
    marginBottom: spacing.xs,
  },
  priceLine: {
    height: 20,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '40%',
    marginBottom: spacing.xs,
  },
  stockLine: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '50%',
    marginBottom: spacing.md,
  },
  buttonLine: {
    height: 44,
    backgroundColor: colors.border,
    borderRadius: radii.pill,
  },
});

