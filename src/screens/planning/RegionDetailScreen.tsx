import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { PREFERENCE_LABEL } from '../../lib/labels';
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'RegionDetail'>;
type Rt = RouteProp<OnboardingStackParamList, 'RegionDetail'>;

export function RegionDetailScreen() {
  const navigation = useNavigation<Nav>();
  const {
    params: { region },
  } = useRoute<Rt>();
  const { plan, setSelectedRegion } = usePlanning();
  const purposes = [
    ...new Set(plan.interpretation?.purposes ?? plan.preferences.map((p) => PREFERENCE_LABEL[p])),
  ];
  const reasons = region.reasonsDetail?.length
    ? region.reasonsDetail
    : region.reasons.map((description) => ({ title: '이런 이유로 추천해요', description }));

  const selectRegion = () => {
    setSelectedRegion(region);
    navigation.navigate('CorePlaces');
  };

  return (
    <SafeAreaView
      style={[styles.safe, Platform.OS === 'web' && styles.webSafe]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.iconButton}
          accessibilityLabel="뒤로 가기"
        >
          <Ionicons name="chevron-back" size={26} color="#252725" />
        </Pressable>
        <Text style={styles.headerTitle}>자세히 보기</Text>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          hitSlop={12}
          style={styles.iconButton}
          accessibilityLabel="홈으로 가기"
        >
          <Ionicons name="home-outline" size={28} color="#252725" />
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.imageWrap}>
            {region.imageUrl ? (
              <Image source={{ uri: region.imageUrl }} style={styles.image} resizeMode="cover" />
            ) : (
              <Ionicons name="image-outline" size={40} color="#86988C" />
            )}
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.regionName}>{region.name}</Text>
            <Text style={styles.heroSubtitle}>내가 고른 취향으로 살펴볼 여행지</Text>
            <View style={styles.tags}>
              {purposes.map((purpose) => (
                <View key={purpose} style={styles.tag}>
                  <Text style={styles.tagText}>{purpose}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <Text style={styles.reasonHeading}>왜 {region.name}를 추천했나요?</Text>
        <View style={styles.reasonCard}>
          {reasons.map((reason, index) => (
            <View key={`${index}-${reason.title}`} style={styles.reasonRow}>
              <Text style={styles.reasonNumber}>{String(index + 1).padStart(2, '0')}</Text>
              <View style={styles.reasonBody}>
                <Text style={styles.reasonTitle}>{reason.title}</Text>
                <Text style={styles.reasonDescription}>{reason.description}</Text>
              </View>
            </View>
          ))}
        </View>
        <Pressable onPress={selectRegion} style={styles.selectButton}>
          <Text style={styles.selectText}>{region.name} 선택하기</Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" style={styles.selectArrow} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FCFAF7' },
  webSafe: { marginTop: -56, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 17,
    gap: 9,
  },
  iconButton: { width: 32, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 16, color: '#666760' },
  content: { paddingHorizontal: 28, paddingBottom: 32 },
  hero: {
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  imageWrap: {
    height: 155,
    backgroundColor: '#E9EEE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  heroBody: { paddingHorizontal: 17, paddingTop: 17, paddingBottom: 23 },
  regionName: { fontSize: 30, lineHeight: 40, color: '#252725', fontWeight: '500' },
  heroSubtitle: { marginTop: 4, fontSize: 14, lineHeight: 21, color: '#343630' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 13 },
  tag: {
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  tagText: { fontSize: 12, color: '#343630' },
  reasonHeading: {
    marginTop: 27,
    marginBottom: 16,
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '700',
    color: '#252725',
  },
  reasonCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 17,
    paddingHorizontal: 17,
    paddingVertical: 21,
    gap: 25,
  },
  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  reasonNumber: { paddingTop: 3, fontSize: 12, fontWeight: '600', color: '#CD593C' },
  reasonBody: { flex: 1 },
  reasonTitle: { fontSize: 15, lineHeight: 22, fontWeight: '700', color: '#252725' },
  reasonDescription: { marginTop: 5, fontSize: 12, lineHeight: 19, color: '#77766F' },
  selectButton: {
    minHeight: 53,
    marginTop: 23,
    borderRadius: 11,
    backgroundColor: '#24443A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 13,
  },
  selectText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  selectArrow: { position: 'absolute', right: 18 },
});
