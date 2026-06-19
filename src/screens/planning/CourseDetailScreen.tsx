import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import type { TransportLeg } from '../../api/recommend';
import { useOnboarding } from '../../lib/onboardingStore';
import { usePlanning } from '../../lib/planningStore';
import { colors, spacing } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CourseDetail'>;
type Rt = RouteProp<OnboardingStackParamList, 'CourseDetail'>;

// 이동수단 -> 아이콘 매핑
function transportIcon(mode: string): keyof typeof Ionicons.glyphMap {
  if (mode.includes('도보')) return 'walk-outline';
  if (mode.includes('자동차') || mode.includes('택시')) return 'car-outline';
  if (mode.includes('버스')) return 'bus-outline';
  if (mode.includes('지하철') || mode.includes('전철') || mode.includes('기차'))
    return 'train-outline';
  return 'navigate-outline';
}

// "도보 · 약 5분 소요" / "지하철 이용 · 1회 환승 · 약 15분 소요"
function transportLabel(t: TransportLeg): string {
  if (!t) return '';
  const parts: string[] = [];
  parts.push(t.mode.includes('도보') ? '도보' : `${t.mode} 이용`);
  if (t.note && t.note.trim()) parts.push(t.note.trim());
  parts.push(`약 ${t.durationMinutes}분 소요`);
  return parts.join(' · ');
}

export function CourseDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const { profile } = useOnboarding();
  const { plan } = usePlanning();
  const [selectedDay, setSelectedDay] = useState(1);

  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  const course = plan.courses?.courses[params.courseIndex];
  const regionName = plan.courses?.regionName ?? plan.result?.regionName ?? '';
  const displayName = profile.name || 'ㅇㅇ';

  if (!course) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.empty}>코스 정보를 찾을 수 없어요</Text>
          <Pressable onPress={goHome} hitSlop={12}>
            <Text style={styles.homeText}>홈으로</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const day = course.days.find((d) => d.day === selectedDay) ?? course.days[0];

  const onSave = () => Alert.alert('경로 저장', '경로가 저장되었어요.');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.textStrong} />
        </Pressable>
        <Pressable onPress={goHome} hitSlop={12} style={styles.iconBtn}>
          <Ionicons name="home-outline" size={24} color={colors.textStrong} />
        </Pressable>
      </View>

      <Text style={styles.title}>
        {displayName}님을 위한{'\n'}
        {regionName} {course.purpose} 여행 경로
      </Text>

      {/*
        TODO(지도): Kakao Map 연동 영역.
        - 본승님 구현 예정. 지금은 빈 박스 placeholder.
        - 마킹 데이터: course.days[].visits[].{ latitude, longitude, order, name }
          (현재 선택된 day 의 방문지: day.visits) 를 Kakao Map 위에 순서대로 마커/폴리라인으로 표시.
      */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={28} color={colors.textSecondary} />
        <Text style={styles.mapHint}>지도 영역 (Kakao Map 연동 예정)</Text>
      </View>

      {/* DAY 탭 */}
      <View style={styles.tabs}>
        {course.days.map((d) => {
          const active = d.day === day.day;
          return (
            <Pressable key={d.day} onPress={() => setSelectedDay(d.day)} style={styles.tab}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>DAY {d.day}</Text>
              {active && <View style={styles.tabUnderline} />}
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.timeline} showsVerticalScrollIndicator={false}>
        {day.visits.map((visit, idx) => (
          <View key={`${visit.order}-${idx}`}>
            <View style={styles.visitRow}>
              <View style={styles.orderBadge}>
                <Text style={styles.orderText}>{visit.order}</Text>
              </View>
              <View style={styles.visitCard}>
                <Text style={styles.visitName}>{visit.name}</Text>
                <Text style={styles.visitDesc}>{visit.description}</Text>
              </View>
            </View>

            {visit.transportToNext && (
              <View style={styles.transportRow}>
                <View style={styles.transportPill}>
                  <Ionicons
                    name={transportIcon(visit.transportToNext.mode)}
                    size={16}
                    color={colors.textStrong}
                  />
                  <Text style={styles.transportText}>{transportLabel(visit.transportToNext)}</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* 경로 저장 */}
      <Pressable style={styles.saveBtn} onPress={onSave}>
        <Ionicons name="bookmark-outline" size={22} color={colors.textStrong} />
        <Text style={styles.saveText}>경로 저장</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  empty: { fontSize: 16, color: colors.textSecondary },
  homeText: {
    fontSize: 16,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textStrong,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  mapPlaceholder: {
    marginHorizontal: spacing.lg,
    height: 150,
    borderRadius: 16,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  mapHint: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  tab: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textStrong,
    fontWeight: '700',
  },
  tabUnderline: {
    marginTop: 6,
    height: 2,
    width: '100%',
    backgroundColor: colors.textStrong,
    borderRadius: 1,
  },
  timeline: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
  },
  visitRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.actionPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  orderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  visitCard: {
    flex: 1,
    backgroundColor: '#F4F7FD',
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.xs,
  },
  visitName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textStrong,
  },
  visitDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginLeft: 28 + spacing.md,
  },
  transportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E8F0',
    borderRadius: 50,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  transportText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textStrong,
  },
  saveBtn: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  saveText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textStrong,
  },
});
