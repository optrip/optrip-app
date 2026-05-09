import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Intro'>;

export function IntroScreen() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    const t = setTimeout(() => navigation.replace('InfoNotice'), 1800);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.line}>
        <Text style={styles.brand}>OpTrip</Text>
        <Text>은</Text>
      </Text>
      <Text style={styles.line}>사용자 맞춤형</Text>
      <Text style={styles.line}>여행지 추천 서비스예요</Text>
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
  line: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
  },
  brand: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
