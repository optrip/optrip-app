import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Intro'), 1500);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>환영합니다</Text>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
