import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import type { Gender, OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'GenderSelect'>;

type GenderOption = Gender | 'none';

const OPTIONS: { value: GenderOption; label: string }[] = [
  { value: 'female', label: '여성' },
  { value: 'male', label: '남성' },
  { value: 'none', label: '선택하지 않음' },
];

export function GenderSelectScreen() {
  const navigation = useNavigation<Nav>();
  const { profile, setGender } = useOnboarding();
  const [selected, setSelected] = useState<GenderOption | null>(
    (profile.gender as GenderOption) || null,
  );
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
    if (!selected) return;
    setGender(selected as Gender);
    navigation.navigate('BirthYear');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Animated.View style={[styles.flex, { opacity }]}>
        <KeyboardAvoidingView style={styles.flex}>
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
            <Text style={styles.headerTitle}>기본 정보 · 선택</Text>
          </View>

          {/* 본문 영역 */}
          <View style={styles.body}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>성별을 알려주세요</Text>
              <Text style={styles.subtitle}>선택하지 않아도 서비스를 이용할 수 있어요.</Text>
            </View>

            {/* 성별 선택 카드 목록 */}
            <View style={styles.optionsList}>
              {OPTIONS.map(({ value, label }) => {
                const isSelected = selected === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.card, isSelected && styles.cardSelected]}
                    activeOpacity={0.8}
                    onPress={() => setSelected(value)}
                  >
                    <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>
                      {label}
                    </Text>
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 하단 버튼 영역 */}
          <View style={styles.footer}>
            <PrimaryButton label="다음" onPress={submit} disabled={!selected} />
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
  optionsList: {
    gap: 12,
  },
  card: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  cardSelected: {
    backgroundColor: '#EAF2ED',
    borderColor: '#23382B',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  cardTextSelected: {
    fontWeight: '700',
    color: '#1F2A23',
  },
  checkIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#23382B',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
