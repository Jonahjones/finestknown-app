import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../design/tokens';

interface ResourceSidebarSectionProps {
  title: string;
  children: ReactNode;
}

export function ResourceSidebarSection({ title, children }: ResourceSidebarSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

interface ResourceSidebarProps {
  children: ReactNode;
}

export function ResourceSidebar({ children }: ResourceSidebarProps) {
  return <View style={styles.sidebar}>{children}</View>;
}

export function ResourceSidebarText({ children }: { children: ReactNode }) {
  return <Text style={styles.text}>{children}</Text>;
}

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.ivory,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

