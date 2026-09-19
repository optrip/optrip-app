import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../lib/theme';

const LOGO = require('../../../assets/logo/optrip-medium.png');

export function FirstLogoScreen() {
  const navigation = useNavigation<any>();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    const seq = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(1200),
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: useNative }),
    ]);

    seq.start(({ finished }) => {
      if (finished) navigation.replace('Welcome2');
    });

    return () => seq.stop();
  }, [navigation, opacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.block, { opacity }]}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Text style={styles.slogan}>여행을 결정하는 더 나은 방법</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#F9F8F4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPaddingX || 24,
  },
  block: {
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 70,
    marginBottom: 12,
  },
  slogan: {
    fontSize: 14,
    color: colors.textSecondary || '#666666',
    fontWeight: '500',
    letterSpacing: -0.3,
  },
});
