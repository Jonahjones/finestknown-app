import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface ParallaxScrollViewProps {
  children: React.ReactNode;
  headerBackgroundColor: { light: string; dark: string };
  headerImage: React.ReactElement;
}

export default function ParallaxScrollView({
  children,
  headerBackgroundColor,
  headerImage,
}: ParallaxScrollViewProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor.light }]}>
        {headerImage}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 250,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});














