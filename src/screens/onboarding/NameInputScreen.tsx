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

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'NameInput'>;

export function NameInputScreen() {
  const navigation = useNavigation<Nav>();
  const { profile, setName } = useOnboarding();
  const [value, setValue] = useState(profile.name);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setName(trimmed);
    navigation.navigate('GenderSelect');
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
          <Text style={styles.title}>이름을 입력해 주세요</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={submit}
            maxLength={20}
            placeholder=""
          />
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="다음" onPress={submit} disabled={!value.trim()} />
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
    fontSize: 24,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
