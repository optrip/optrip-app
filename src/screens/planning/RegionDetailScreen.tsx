import { ImageBackground, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'RegionDetail'>;
type Rt = RouteProp<OnboardingStackParamList, 'RegionDetail'>;

export function RegionDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const { setSelectedRegion } = usePlanning();
  const { region } = params;

  const selectRegion = () => {
    setSelectedRegion(region);
    navigation.goBack();
  };

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
        <View style={styles.hero}>
          <ImageBackground
            source={region.imageUrl ? { uri: region.imageUrl } : undefined}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
          >
            <View style={styles.heroWash} />
            <Text style={styles.heroTitle}>{region.name}</Text>
          </ImageBackground>

          <View style={styles.reasonPanel}>
            <Text style={styles.reasonTitle}>추천 이유</Text>
            <View style={styles.divider} />
            <Text style={styles.reasonText}>{region.reasons.join('\n')}</Text>
          </View>
        </View>

        <Pressable onPress={selectRegion} style={styles.selectButton}>
          <Text style={styles.selectText}>{region.name} 선택하기</Text>
          <Ionicons name="chevron-forward" size={24} color="#737744" />
        </Pressable>
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
  content: { flex: 1, paddingHorizontal: 45, paddingTop: 38 },
  hero: { height: 470, position: 'relative' },
  heroImage: {
    height: 315,
    borderRadius: 27,
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D28B98',
    shadowColor: '#7E5860',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  heroImageStyle: { borderRadius: 25 },
  heroWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250, 250, 246, 0.45)',
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
    transform: [{ translateY: -42 }],
  },
  reasonPanel: {
    position: 'absolute',
    top: 195,
    left: 0,
    right: 0,
    height: 290,
    paddingHorizontal: 28,
    paddingTop: 27,
    borderWidth: 1,
    borderColor: '#C1C394',
    borderRadius: 27,
    backgroundColor: '#F9F7F2',
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  reasonTitle: { fontSize: 20, fontWeight: '500', color: '#222222' },
  divider: { height: 2, width: '78%', marginTop: 8, backgroundColor: '#BF6570' },
  reasonText: { marginTop: 18, fontSize: 14, lineHeight: 21, color: '#555555' },
  selectButton: {
    height: 52,
    marginHorizontal: -1,
    marginTop: 36,
    borderRadius: 28,
    backgroundColor: '#D0D3B5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  selectText: { fontSize: 19, fontWeight: '600', color: '#111111' },
});
