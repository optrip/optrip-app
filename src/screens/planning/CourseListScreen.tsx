import { View, Text, Pressable, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { usePlanning } from '../../lib/planningStore';
import { colors, spacing } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CourseList'>;

// 코스 카드 배경 이미지 (purpose 무관, 분위기용)
const CARD_IMAGES = [
  'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
];

export function CourseListScreen() {
  const navigation = useNavigation<Nav>();
  const { plan } = usePlanning();
  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  const courses = plan.courses?.courses ?? [];
  const regionName = plan.courses?.regionName ?? plan.result?.regionName ?? '';

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

      <Text style={styles.title}>{regionName}</Text>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {courses.length === 0 && <Text style={styles.empty}>코스가 없어요</Text>}

        {courses.map((course, index) => (
          <Pressable
            key={`${course.purpose}-${index}`}
            style={styles.card}
            onPress={() => navigation.navigate('CourseDetail', { courseIndex: index })}
          >
            <ImageBackground
              source={{ uri: CARD_IMAGES[index % CARD_IMAGES.length] }}
              style={styles.cardBg}
              imageStyle={styles.cardBgImage}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardPurpose}>{course.purpose} 코스</Text>
                <Text style={styles.cardSummary} numberOfLines={2}>
                  {course.summary}
                </Text>
              </View>
              <View style={styles.cardBottom}>
                <View style={styles.detailChip}>
                  <Text style={styles.detailText}>자세히 보기</Text>
                  <Ionicons name="chevron-forward" size={15} color={colors.textStrong} />
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_RADIUS = 24;

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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textStrong,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
  card: {
    width: '100%',
    height: 200,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  cardBg: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  cardBgImage: {
    borderRadius: CARD_RADIUS,
    opacity: 0.85,
  },
  cardTop: {
    gap: spacing.xs,
  },
  cardPurpose: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 6,
  },
  cardSummary: {
    fontSize: 14,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 6,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 50,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textStrong,
  },
});
