import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../design/tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  borderRadius?: number;
}

export function Skeleton({ 
  width = '100%', 
  height = 20, 
  style, 
  borderRadius = radius.sm 
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    
    animate();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

// Specialized skeleton components
export function SkeletonImage({ width = '100%', height = 200, style }: SkeletonProps) {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={radius.md}
      style={style}
    />
  );
}

export function SkeletonText({ width = '100%', style }: Omit<SkeletonProps, 'height'>) {
  return (
    <Skeleton
      width={width}
      height={16}
      borderRadius={4}
      style={[{ marginBottom: spacing.xs }, style]}
    />
  );
}

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <SkeletonImage height={160} style={{ marginBottom: spacing.m }} />
      <SkeletonText width="80%" />
      <SkeletonText width="60%" />
      <SkeletonText width="40%" style={{ marginTop: spacing.s }} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.silver,
  },
  card: {
    backgroundColor: colors.ivory,
    borderRadius: radius.md,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
});
