import { useEffect, useState } from 'react';
import { ImageBackground, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { getMockRegionRecommendations, type RegionCandidate } from '../../api/regions';
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'RegionCandidates'>;

export function RegionCandidatesScreen() {
  const navigation = useNavigation<Nav>();
  const { plan } = usePlanning();
  const [regions, setRegions] = useState<RegionCandidate[]>([]);

  useEffect(() => {
    getMockRegionRecommendations().then((response) => setRegions(response.regions));
  }, []);

  return (
    <SafeAreaView
      style={[styles.safe, Platform.OS === 'web' && styles.webSafe]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={30} color="#222222" />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Home')} hitSlop={12} style={styles.iconButton}>
          <Ionicons name="home-outline" size={29} color="#222222" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>길동님을 위한 추천 여행지</Text>

        <View style={styles.list}>
          {regions.map((region) => {
            const selected = plan.selectedRegion?.name === region.name;
            return (
              <Pressable
                key={`${region.name}-${region.lDongSignguCd}`}
                onPress={() => navigation.navigate('RegionDetail', { region })}
                style={[styles.card, selected && styles.cardSelected]}
              >
                <ImageBackground
                  source={region.imageUrl ? { uri: region.imageUrl } : undefined}
                  style={styles.cardImage}
                  imageStyle={styles.cardImageStyle}
                >
                  <View style={styles.imageWash} />
                  <View style={styles.cardText}>
                    <View style={styles.nameRow}>
                      <Text style={styles.regionName}>{region.name}</Text>
                      {region.source === 'ai' && (
                        <View style={styles.aiBadge}>
                          <Ionicons name="sparkles" size={11} color="#16758A" />
                          <Text style={styles.aiBadgeText}>AI 추천</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.reasons} numberOfLines={1}>
                      {region.reasons.join(' / ')}
                    </Text>
                  </View>
                  <View style={styles.detailButton}>
                    <Text style={styles.detailText}>자세히 보기</Text>
                    <Ionicons name="chevron-forward" size={16} color="#444444" />
                  </View>
                </ImageBackground>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F7F2' },
  webSafe: { marginTop: -56, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 36, paddingTop: 32 },
  title: {
    fontSize: 23,
    lineHeight: 31,
    fontWeight: '500',
    color: '#111111',
    marginBottom: 25,
  },
  list: { gap: 20 },
  card: {
    height: 158,
    borderRadius: 27,
    overflow: 'hidden',
    backgroundColor: '#E9E9E3',
  },
  cardSelected: { borderWidth: 2, borderColor: '#A9AD70' },
  cardImage: { flex: 1, justifyContent: 'space-between', padding: 24 },
  cardImageStyle: { borderRadius: 27 },
  imageWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250, 250, 246, 0.45)',
  },
  cardText: { gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  regionName: { fontSize: 26, fontWeight: '600', color: '#111111' },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#B9E5EE',
  },
  aiBadgeText: { fontSize: 10, color: '#177387', fontWeight: '600' },
  reasons: { fontSize: 14, color: '#5F5F5F', fontWeight: '500' },
  detailButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(238, 239, 232, 0.9)',
  },
  detailText: { fontSize: 12, color: '#444444' },
});
