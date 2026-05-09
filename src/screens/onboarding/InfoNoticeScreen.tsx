import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'InfoNotice'>;

export function InfoNoticeScreen() {
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
      if (finished) navigation.replace('NameInput');
    });
    return () => seq.stop();
  }, [navigation, opacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.block, { opacity }]}>
        <Text style={styles.line}>더 정교한 추천을 위해</Text>
        <Text style={styles.line}>회원님의 정보가 필요해요</Text>
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
  line: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
  },
});
