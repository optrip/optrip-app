import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackLink } from '../../components/BackLink';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useOnboarding } from '../../lib/onboardingStore';
import { colors, spacing } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'BirthYear'>;

export function BirthYearScreen() {
  const navigation = useNavigation<Nav>();
  const { profile, setBirthYear } = useOnboarding();
  const [value, setValue] = useState(profile.birthYear);

  const valid = /^\d{4}$/.test(value) && Number(value) >= 1900 && Number(value) <= 2026;

  const submit = () => {
    if (!valid) return;
    setBirthYear(value);
    navigation.navigate('JobSelect');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <BackLink />
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>태어난 연도를 입력해 주세요</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(t) => setValue(t.replace(/[^0-9]/g, ''))}
            placeholder="YYYY"
            placeholderTextColor="#B0B0B0"
            keyboardType="number-pad"
            autoFocus
            maxLength={4}
            returnKeyType="next"
            onSubmitEditing={submit}
          />
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="다음" onPress={submit} disabled={!valid} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.md,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xxl * 2,
  },
  input: {
    fontSize: 28,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingVertical: spacing.sm,
    textAlign: 'center',
    letterSpacing: 4,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
