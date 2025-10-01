import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../src/design/tokens';

export default function TabBarBackground() {
  return <View style={styles.background} />;
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
});
