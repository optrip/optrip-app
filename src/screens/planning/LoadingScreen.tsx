import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Loading'>;

const LOGO = require('../../../assets/logo/optrip-large.png');
const DISPLAY_MS = 900;

export function LoadingScreen() {
  const navigation = useNavigation<Nav>();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: DISPLAY_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => navigation.replace('InterpretationReview'), DISPLAY_MS);
    return () => {
      clearTimeout(timer);
      progress.stopAnimation();
    };
  }, [navigation, progress]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>여행 내용을 이해하고 있어요</Text>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: fillWidth }]} />
      </View>
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
  title: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 },
  logo: { width: 200, height: 72, marginBottom: 36 },
  track: {
    width: 260,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E5E3D7',
    overflow: 'hidden',
  },
  fill: { height: 3, backgroundColor: '#8F9A68', borderRadius: 2 },
});

export default LoadingScreen;
