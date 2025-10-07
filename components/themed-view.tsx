import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  return (
    <View
      style={[{ backgroundColor: lightColor }, style]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    flex: 1,
  },
});














