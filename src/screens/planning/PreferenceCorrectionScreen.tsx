import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import type { OnboardingStackParamList, Preference } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PreferenceCorrection'>;

type Option = {
  value: Preference;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const OPTIONS: Option[] = [
  { value: 'sea', label: '바다', icon: 'boat-outline' },
  { value: 'hiking', label: '하이킹\n트레킹', icon: 'triangle-outline' },
  { value: 'food', label: '맛집', icon: 'restaurant-outline' },
  { value: 'history', label: '역사·문화', icon: 'business-outline' },
  { value: 'nightview', label: '야경', icon: 'moon-outline' },
  { value: 'activity', label: '액티비티', icon: 'bicycle-outline' },
  { value: 'nature', label: '자연·풍경', icon: 'sunny-outline' },
  { value: 'healing', label: '힐링', icon: 'leaf-outline' },
  { value: 'cafe', label: '카페 투어', icon: 'cafe-outline' },
  { value: 'market', label: '시장·먹거리', icon: 'flame-outline' },
  { value: 'culture', label: '문화 체험', icon: 'color-palette-outline' },
  { value: 'photo', label: '감성·사진', icon: 'camera-outline' },
];

const MAX_SELECT = 3;

export function PreferenceCorrectionScreen() {
  const navigation = useNavigation<Nav>();
  const [selected, setSelected] = useState<Preference[]>([]);

  const toggle = (value: Preference) => {
    setSelected((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value);
      if (current.length >= MAX_SELECT) return current;
      return [...current, value];
    });
  };

  const submit = () => {
    navigation.navigate('RegionCandidates');
  };

  return (
    <SafeAreaView
      style={[styles.safe, Platform.OS === 'web' && styles.webSafe]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={32} color="#222222" />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          hitSlop={12}
          style={styles.iconButton}
        >
          <Ionicons name="home-outline" size={32} color="#222222" />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.content}>
        <Text style={styles.title}>원하는 여행을 다시 골라주세요</Text>
        <Text style={styles.subtitle}>최대 3개까지 고를 수 있어요</Text>

        <View style={styles.grid}>
          {OPTIONS.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <Pressable
                key={option.value}
                onPress={() => toggle(option.value)}
                style={[styles.option, isSelected && styles.optionSelected]}
              >
                <Ionicons
                  name={option.icon}
                  size={25}
                  color={isSelected ? '#FFFFFF' : '#A9AD70'}
                />
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={submit}
          disabled={selected.length === 0}
          style={[styles.nextButton, selected.length === 0 && styles.nextButtonDisabled]}
        >
          <Text style={styles.nextText}>다음</Text>
          <Ionicons name="chevron-forward" size={23} color="#61653D" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F7F2' },
  webSafe: {
    marginTop: -56,
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 36,
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '500',
    color: '#111111',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 24,
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  option: {
    width: '31%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#C8CAA7',
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  optionSelected: { backgroundColor: '#D0D3B5' },
  optionLabel: {
    fontSize: 14,
    lineHeight: 19,
    color: '#222222',
    textAlign: 'center',
  },
  optionLabelSelected: { color: '#FFFFFF' },
  footer: {
    paddingHorizontal: 56,
    paddingTop: 8,
    paddingBottom: 36,
  },
  nextButton: {
    height: 54,
    borderRadius: 28,
    backgroundColor: '#D0D3B5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonDisabled: { opacity: 0.5 },
  nextText: { fontSize: 20, fontWeight: '600', color: '#111111' },
});
