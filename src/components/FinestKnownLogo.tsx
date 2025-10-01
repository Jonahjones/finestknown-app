import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../design/tokens';

interface FinestKnownLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: any;
}

export const FinestKnownLogo: React.FC<FinestKnownLogoProps> = ({ 
  size = 'medium', 
  showText = true,
  style 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40 };
      case 'large':
        return { width: 100, height: 100 };
      default:
        return { width: 60, height: 60 };
    }
  };

  const logoSize = getSize();

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../assets/images/348446809_1336157187010999_8984013516405058779_n.jpg')}
        style={[styles.logoImage, logoSize]}
        resizeMode="contain"
      />
      
      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.brandName}>FINEST KNOWN</Text>
          <Text style={styles.tagline}>EXQUISITE HISTORIC RARITIES</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    // Image will be sized by the width/height props
  },
  textContainer: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.navy,
    letterSpacing: 1.2,
  },
  tagline: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    letterSpacing: 0.8,
    marginTop: 2,
  },
});
