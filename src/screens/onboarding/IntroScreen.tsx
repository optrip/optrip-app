import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Intro'>;

const LOGO = require('../../../assets/logo/optrip-medium.png');

export function IntroScreen() {
  const navigation = useNavigation<Nav>();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    const seq = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(1100),
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: useNative }),
    ]);
    seq.start(({ finished }) => {
      if (finished) navigation.replace('InfoNotice');
    });
    return () => seq.stop();
  }, [navigation, opacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.block, { opacity }]}>
        <View style={styles.firstLine}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          <Text style={styles.line}>은</Text>
        </View>
        <Text style={styles.line}>사용자 맞춤형</Text>
        <Text style={styles.line}>여행지 추천 서비스예요</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPaddingX,
  },
  block: {
    alignItems: 'center',
  },
  firstLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  logo: {
    width: 110,
    height: 42,
    marginRight: 2,
  },
  line: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
  },
});
