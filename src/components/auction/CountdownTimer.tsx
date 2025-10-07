import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { typography } from '../../design/tokens';
import { colors } from '../../theme';

interface CountdownTimerProps {
  endAt: string;
  onExpire?: () => void;
}

export function CountdownTimer({ endAt, onExpire }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const calculateRemaining = () => {
      const now = Date.now();
      const end = new Date(endAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setRemaining('Ended');
        if (onExpire) {
          onExpire();
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let formatted = '';
      
      if (days > 0) {
        // Show days
        formatted = `${days}d ${hours}h`;
      } else if (hours > 0) {
        // Show hours and minutes
        formatted = `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        // Show minutes and seconds
        formatted = `${minutes}m ${seconds}s`;
      } else {
        // Show only seconds
        formatted = `${seconds}s`;
      }

      setRemaining(formatted);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [endAt, onExpire]);

  return <Text style={styles.timer}>{remaining}</Text>;
}

const styles = StyleSheet.create({
  timer: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
});

