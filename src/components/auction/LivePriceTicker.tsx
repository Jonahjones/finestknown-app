import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { typography } from '../../design/tokens';
import { auctionTokens } from '../../design/tokens.auction';
import { colors } from '../../theme';

export type AuctionStatus = 'scheduled' | 'live' | 'ended';

interface LivePriceTickerProps {
  amountCents: number;
  status: AuctionStatus;
}

export function LivePriceTicker({ amountCents, status }: LivePriceTickerProps) {
  const [displayAmount, setDisplayAmount] = useState(amountCents);
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (amountCents !== displayAmount && status === 'live') {
      // Flash animation
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: false,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
    setDisplayAmount(amountCents);
  }, [amountCents, displayAmount, flashAnim, status]);

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', auctionTokens.up],
  });

  const formattedPrice = `$${(displayAmount / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.price}>{formattedPrice}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  price: {
    fontSize: typography.heading.size,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
});

