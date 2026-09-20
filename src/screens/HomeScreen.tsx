import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useOnboarding } from '../lib/onboardingStore';
import { usePlanning } from '../lib/planningStore';
import { colors, spacing } from '../lib/theme';
import type { OnboardingStackParamList } from '../navigation/types';

const LOGO = require('../../assets/logo/optrip-small.png');

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Home'>;

// 상단 메인 카드 배경 이미지 후보 4종
const MAIN_BG_CANDIDATES = [
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80', // 신비로운 숲
  'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1000&q=80', // 자연속 기차
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80', // 푸른 호수와 산
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', // 계곡과 숲
];

const CURATION_BG =
  'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1000&q=80';

export const HomeScreen = () => {
  const { profile } = useOnboarding();
  const { reset } = usePlanning();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  // 메인 카드 배경 이미지 상태
  const [mainBg, setMainBg] = useState(MAIN_BG_CANDIDATES[0]);

  // 홈 화면이 포커스될 때마다 랜덤 이미지 추출
  useFocusEffect(
    useCallback(() => {
      const randomIndex = Math.floor(Math.random() * MAIN_BG_CANDIDATES.length);
      setMainBg(MAIN_BG_CANDIDATES[randomIndex]);
    }, []),
  );

  // 여행 스케줄링 시작 함수 (플래닝 데이터 리셋 후 Schedule 화면으로 이동)
  const startPlanning = () => {
    reset();
    navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'Schedule' }] });
  };

  const userName = profile.name ? `${profile.name}님` : '승희님';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 메인 메세지 카드 (랜덤 배경 적용) */}
        <View style={styles.mainCardContainer}>
          <ImageBackground
            source={{ uri: mainBg }}
            style={styles.mainCardBg}
            imageStyle={{ borderRadius: 20 }}
          >
            <View style={styles.mainCardOverlay}>
              <Text style={styles.mainTitle}>
                {userName},{'\n'}어떤 하루를 만들까요?
              </Text>
              <Text style={styles.mainSubtitle}>
                목적지를 정하지 않아도 괜찮아요.{'\n'}하고 싶은 걸 말로 적으면 지역부터 좁혀드려요.
              </Text>
            </View>
          </ImageBackground>

          {/* 여행 시작하기 버튼 */}
          <TouchableOpacity style={styles.startButton} activeOpacity={0.85} onPress={startPlanning}>
            <Text style={styles.startButtonText}>여행 시작하기</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 이번 주 큐레이션 섹션 */}
        <View style={styles.curationSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>이번 주 큐레이션</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
              <Text style={styles.moreText}>더 보기</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.curationCard} activeOpacity={0.85} onPress={() => {}}>
            <Image source={{ uri: CURATION_BG }} style={styles.curationImage} resizeMode="cover" />
            <View style={styles.curationFooter}>
              <Text style={styles.curationTag}>걷는 여행 — 01</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 하단 네비게이션 바 */}
      <View
        style={[styles.bottomNav, { height: 68 + insets.bottom, paddingBottom: insets.bottom }]}
      >
        {/* 좌측 */}
        <TouchableOpacity style={styles.navItem} activeOpacity={1}>
          <View style={styles.activeIconBg}>
            <Ionicons name="home" size={22} color="#23382B" />
          </View>
          <Text style={[styles.navLabel, styles.navLabelActive]}>홈</Text>
        </TouchableOpacity>

        {/* 중앙 */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={startPlanning}>
          <Ionicons name="compass-outline" size={24} color="#777777" />
          <Text style={styles.navLabel}>여행 시작하기</Text>
        </TouchableOpacity>

        {/* 우측 */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MyPage')}
        >
          <Ionicons name="person-outline" size={24} color="#777777" />
          <Text style={styles.navLabel}>MY</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background || '#F9F8F4',
  },
  header: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background || '#F9F8F4',
  },
  logoImage: {
    width: 80,
    height: 28,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingX || 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  mainCardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#3E5045',
    marginBottom: 28,
  },
  mainCardBg: {
    width: '100%',
    height: 240,
  },
  mainCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(35, 56, 43, 0.45)',
    padding: 24,
    justifyContent: 'flex-start',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 32,
    marginBottom: 12,
  },
  mainSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 19,
  },
  startButton: {
    height: 52,
    backgroundColor: '#23382B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  curationSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  moreText: {
    fontSize: 13,
    color: '#5A6B5C',
    fontWeight: '500',
  },
  curationCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  curationImage: {
    width: '100%',
    height: 150,
  },
  curationFooter: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  curationTag: {
    fontSize: 13,
    color: '#C05A46',
    fontWeight: '600',
  },
  bottomNav: {
    backgroundColor: '#F9F8F4',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeIconBg: {
    width: 36,
    height: 28,
    backgroundColor: '#EAF2ED',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 11,
    color: '#777777',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#23382B',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
