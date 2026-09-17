import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { recommendRegions, type RegionCandidate } from '../../api/regions';
import { PREFERENCE_LABEL } from '../../lib/labels';
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'RegionCandidates'>;
const matchLabel = (region: RegionCandidate) =>
  region.matchedPurposes != null && region.totalPurposes != null
    ? `취향 ${region.matchedPurposes}/${region.totalPurposes} 일치`
    : region.source === 'ai'
      ? 'AI 추천'
      : '직접 선택';

export function RegionCandidatesScreen() {
  const navigation = useNavigation<Nav>();
  const { plan } = usePlanning();
  const [regions, setRegions] = useState<RegionCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    recommendRegions({
      purposes: plan.interpretation?.purposes ?? plan.preferences.map((p) => PREFERENCE_LABEL[p]),
      excludeRegions: plan.excludeRegions,
      limit: 3,
    })
      .then((response) => {
        if (active) setRegions(response.regions);
      })
      .catch(() => {
        if (active) setError('여행지 후보를 불러오지 못했어요.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [plan.excludeRegions, plan.interpretation?.purposes, plan.preferences]);
  const detailButton = (region: RegionCandidate) => (
    <Pressable
      style={styles.detailButton}
      onPress={() => navigation.navigate('RegionDetail', { region })}
      accessibilityRole="button"
      accessibilityLabel={`${region.name} 자세히 보기`}
    >
      <Text style={styles.detailText}>자세히 보기</Text>
      <Ionicons name="chevron-forward" size={16} color="#24443A" />
    </Pressable>
  );
  const first = regions[0];
  return (
    <SafeAreaView
      style={[styles.safe, Platform.OS === 'web' && styles.webSafe]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="뒤로 가기">
          <Ionicons name="chevron-back" size={27} color="#252725" />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {loading || regions.length === 3
            ? '세 곳을 비교하고 골라주세요'
            : `${regions.length}곳을 비교하고 골라주세요`}
        </Text>
        <Text style={styles.subtitle}>AI가 조건에 맞는 후보만 남겼습니다.</Text>
        {loading && <Text style={styles.status}>여행지 후보를 불러오는 중이에요...</Text>}
        {error && <Text style={styles.status}>{error}</Text>}
        {first && (
          <View style={styles.featuredCard}>
            <View style={styles.imageWrap}>
              {first.imageUrl ? (
                <Image source={{ uri: first.imageUrl }} style={styles.image} resizeMode="cover" />
              ) : (
                <Ionicons name="image-outline" size={36} color="#86988C" />
              )}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>추천</Text>
              </View>
            </View>
            <View style={styles.featuredBody}>
              <View style={styles.nameRow}>
                <Text style={styles.featuredName}>{first.name}</Text>
                <Text style={styles.match}>{matchLabel(first)}</Text>
              </View>
              <Text style={styles.reason} numberOfLines={2}>
                {first.reasons.join(' · ')}
              </Text>
              <View style={styles.divider} />
              <View style={styles.factsRow}>
                <Text style={styles.fact}>
                  {first.candidateCount != null
                    ? `후보 ${first.candidateCount}곳`
                    : '취향에 맞는 후보'}{' '}
                </Text>
                {detailButton(first)}
              </View>
            </View>
          </View>
        )}
        <View style={styles.smallRow}>
          {regions.slice(1, 3).map((region) => (
            <View key={`${region.lDongRegnCd}-${region.lDongSignguCd}`} style={styles.smallCard}>
              <View style={styles.nameRow}>
                <Text style={styles.smallName}>{region.name}</Text>
                <Ionicons name="compass-outline" size={19} color="#24443A" />
              </View>
              <Text style={styles.smallReason} numberOfLines={2}>
                {region.reasons.join(' · ')}
              </Text>
              <Text style={styles.smallMatch}>{matchLabel(region)}</Text>
              <View style={styles.smallDetail}>{detailButton(region)}</View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={styles.conditionButton}
          onPress={() => navigation.navigate('PreferenceCorrection')}
          accessibilityRole="button"
        >
          <Text style={styles.conditionText}>조건 수정하기</Text>
          <Ionicons name="chevron-forward" size={20} color="#24443A" style={styles.arrow} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FCFAF7' },
  webSafe: { marginTop: -56, paddingTop: 56 },
  header: { paddingHorizontal: 28, paddingTop: 15, paddingBottom: 10 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 28, paddingTop: 26, paddingBottom: 24 },
  title: { fontSize: 24, lineHeight: 33, fontWeight: '700', color: '#252725' },
  subtitle: { marginTop: 8, marginBottom: 26, fontSize: 14, lineHeight: 21, color: '#77766F' },
  status: { marginBottom: 20, fontSize: 13, color: '#77766F' },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 17,
    overflow: 'hidden',
  },
  imageWrap: {
    height: 145,
    backgroundColor: '#E9EEE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FCFAF7',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#24443A' },
  featuredBody: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  featuredName: { flex: 1, fontSize: 25, fontWeight: '700', color: '#252725' },
  match: { fontSize: 12, fontWeight: '600', color: '#CE5A3B' },
  reason: { marginTop: 10, fontSize: 13, lineHeight: 20, color: '#77766F' },
  divider: { height: 1, backgroundColor: '#E4DDD5', marginTop: 16, marginBottom: 6 },
  factsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  fact: { flex: 1, fontSize: 11, color: '#77766F' },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
    minHeight: 40,
    paddingLeft: 8,
  },
  detailText: { fontSize: 12, fontWeight: '600', color: '#24443A' },
  smallRow: { flexDirection: 'row', gap: 16, marginTop: 16 },
  smallCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 170,
    paddingHorizontal: 14,
    paddingTop: 19,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 17,
  },
  smallName: { flex: 1, fontSize: 19, fontWeight: '700', color: '#252725' },
  smallReason: { marginTop: 13, fontSize: 12, lineHeight: 18, color: '#77766F' },
  smallMatch: { marginTop: 8, fontSize: 11, color: '#24443A' },
  smallDetail: { marginTop: 'auto', paddingTop: 17 },
  footer: { flexShrink: 0, paddingHorizontal: 28, paddingTop: 10, paddingBottom: 24 },
  conditionButton: {
    minHeight: 53,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  conditionText: { fontSize: 16, fontWeight: '700', color: '#24443A' },
  arrow: { position: 'absolute', right: 18 },
});
