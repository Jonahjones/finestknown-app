import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      onPress={(e) => {
        if (props.onPress) {
          props.onPress(e);
        }
        // Haptic feedback can be added later with expo-haptics
      }}
    />
  );
}
