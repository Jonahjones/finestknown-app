import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadow, spacing, type } from '../../theme';

interface HeroProps {
  imageSource: ImageSourcePropType;
  title: string;
  subtitle?: string;
  showGradient?: boolean;
}

export function Hero({ imageSource, title, subtitle, showGradient = false }: HeroProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
        {showGradient && <View style={styles.gradient} />}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  textContainer: {
    marginTop: spacing.lg,
  },
  title: {
    ...type.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...type.body,
    color: colors.text.secondary,
  },
});

