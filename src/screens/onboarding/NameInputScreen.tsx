import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { PrimaryButton } from '../../components/PrimaryButton';
import { useOnboarding } from '../../lib/onboardingStore';
import { colors, spacing } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'NameInput'>;

export function NameInputScreen() {
  const navigation = useNavigation<Nav>();
  const { profile, setName } = useOnboarding();
  const [value, setValue] = useState(profile.name || '');
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: useNative,
    }).start();
  }, [opacity]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setName(trimmed);
    navigation.navigate('GenderSelect');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Animated.View style={[styles.flex, { opacity }]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* 헤더 영역 */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={28} color="#252725" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>기본 정보</Text>
          </View>

          {/* 본문 입력 영역 */}
          <View style={styles.body}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>어떻게 불러드릴까요?</Text>
              <Text style={styles.subtitle}>앱 안에서 사용할 이름이에요.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>이름</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setValue}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={submit}
                maxLength={20}
                placeholder="이름을 입력해 주세요"
                placeholderTextColor="#AAAAAA"
              />
            </View>
          </View>

          {/* 하단 다음 버튼 */}
          <View style={styles.footer}>
            <PrimaryButton label="다음" onPress={submit} disabled={!value.trim()} />
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background || '#F9F8F4',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.md,
  },
  backButton: {
    paddingRight: 6,
    paddingVertical: 2,
  },
  headerTitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginLeft: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.lg,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary || '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary || '#666666',
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary || '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
