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

const BLUE = '#0088FF';
const PANEL_BG = '#E8EEFB'; // 라이트 블루 패널 (figma rgba(164,190,237,0.2))
const TAB_INACTIVE = '#EEEEEE';

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
  const { profile, saveTrip } = useOnboarding();
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

  // [경로 저장] 내 여행 화면에 코스 저장 (hanyoung 추가 기능 유지)
  const onSave = () => {
    saveTrip({
      title: `${regionName} ${course.purpose} 코스`,
      desc: `${course.days.length}일 코스`,
      image: 'https://picsum.photos/800/600',
    });
    Alert.alert('저장 완료', '내 여행 화면에 코스가 저장되었습니다!');
  };

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

      {/* Kakao Map: day.visits 를 순서대로 마커/폴리라인으로 표시 */}
      {(() => {
        const visits = day.visits.map(v => ({
          lat: v.latitude,
          lng: v.longitude,
          name: v.name,
          order: v.order,
        }));
        const mapHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
            <style>
              * { margin: 0; padding: 0; }
              body { width: 100%; height: 100vh; }
              #map { width: 100%; height: 100%; }
            </style>
          </head>
          <body>
            <div id="map"></div>
            <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=73357f5538851e9d44c950f736a17924&autoload=false&libraries=services"></script>
            <script>
              kakao.maps.load(function() {
                var visits = ${JSON.stringify(visits)};
                if (!visits.length) return;
                var container = document.getElementById('map');
                var center = new kakao.maps.LatLng(visits[0].lat, visits[0].lng);
                var map = new kakao.maps.Map(container, { center: center, level: 7 });
                var path = [];
                visits.forEach(function(v) {
                  var pos = new kakao.maps.LatLng(v.lat, v.lng);
                  path.push(pos);
                  var overlay = new kakao.maps.CustomOverlay({
                    position: pos,
                    map: map,
                    content: '<div style="width:28px;height:28px;background:#0088FF;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);">' + v.order + '</div>',
                    yAnchor: 0.5,
                    xAnchor: 0.5
            });
                });
                if (path.length > 1) {
                  var polyline = new kakao.maps.Polyline({
                    path: path,
                    strokeWeight: 3,
                    strokeColor: '#0088FF',
                    strokeOpacity: 0.8,
                    strokeStyle: 'solid'
                  });
                  polyline.setMap(map);
                }
                var bounds = new kakao.maps.LatLngBounds();
                path.forEach(function(p) { bounds.extend(p); });
                map.setBounds(bounds);
              });
            </script>
          </body>
          </html>
        `;
        return (
          <iframe
            srcDoc={mapHtml}
            style={{
              width: '100%',
              height: 180,
              border: 'none',
              borderRadius: 20,
              marginHorizontal: 20,
            } as any}
            title="kakaomap"
          />
        );
      })()}


      {/* DAY 탭 (패널 위에 붙는 탭 모양) */}
      <View style={styles.tabs}>
        {course.days.map((d) => {
          const active = d.day === day.day;
          return (
            <Pressable
              key={d.day}
              onPress={() => setSelectedDay(d.day)}
              style={[styles.tab, active ? styles.tabActive : styles.tabInactive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>DAY {d.day}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* 일자별 상세 경로 패널 */}
      <View style={styles.panel}>
        <ScrollView contentContainerStyle={styles.timeline} showsVerticalScrollIndicator={false}>
          {day.visits.map((visit, idx) => {
            const isLast = idx === day.visits.length - 1;
            return (
              <View key={`${visit.order}-${idx}`} style={styles.visitBlock}>
                {/* 좌측 레일: 번호 배지 + 세로 라인 */}
                <View style={styles.rail}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{visit.order}</Text>
                  </View>
                  {!isLast && <View style={styles.railLine} />}
                </View>

                {/* 내용: 이름 + 구분선 + 설명 + 이동수단 말풍선 */}
                <View style={styles.content}>
                  <Text style={styles.visitName}>{visit.name}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.visitDesc}>{visit.description}</Text>

                  {visit.transportToNext && (
                    <View style={styles.transportRow}>
                      <View style={styles.transportArrow} />
                      <View style={styles.transportPill}>
                        <Ionicons
                          name={transportIcon(visit.transportToNext.mode)}
                          size={18}
                          color="#1D1B20"
                        />
                        <Text style={styles.transportText}>
                          {transportLabel(visit.transportToNext)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* 경로 저장 */}
      <Pressable style={styles.saveBtn} onPress={onSave}>
        <Ionicons name="bookmark-outline" size={26} color="#111111" />
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
    fontSize: 26,
    fontWeight: '500',
    color: '#111111',
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 33,
  },
  mapPlaceholder: {
    marginHorizontal: 20,
    height: 130,
    borderRadius: 20,
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
    marginTop: spacing.lg,
    marginLeft: 24,
    gap: 7,
  },
  tab: {
    width: 96,
    paddingVertical: 9,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabActive: {
    backgroundColor: PANEL_BG,
  },
  tabInactive: {
    backgroundColor: TAB_INACTIVE,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#767676',
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  panel: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: spacing.md,
    backgroundColor: PANEL_BG,
    borderRadius: 20,
    borderTopLeftRadius: 0,
  },
  timeline: {
    padding: 14,
    paddingBottom: 130, // 마지막 방문지가 패널 하단/플로팅 버튼에 붙지 않도록 여유
  },
  visitBlock: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  rail: {
    width: 40,
    alignItems: 'center',
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  railLine: {
    flex: 1,
    width: 3,
    backgroundColor: BLUE,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 4,
    paddingBottom: spacing.md,
    gap: 4,
  },
  visitName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E3E3E3',
    marginVertical: 2,
  },
  visitDesc: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 20,
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  transportArrow: {
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderRightWidth: 9,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FFFFFF',
    marginRight: -1,
  },
  transportPill: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
  },
  transportText: {
    fontSize: 15,
    color: '#000000',
    textAlign: 'center',
  },
  saveBtn: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#999999',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 1.6, height: 3.3 },
    elevation: 6,
  },
  saveText: {
    fontSize: 10,
    fontWeight: '300',
    color: '#111111',
  },
});
