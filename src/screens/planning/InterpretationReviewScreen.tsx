import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'InterpretationReview'>;

const LINE_BREAK = String.fromCharCode(10);
const MOCK_SUMMARY = [
  '단풍이 아름답고',
  '자연으로 둘러싸인 곳에서',
  '한가롭게 힐링하고,',
  '맛있는 것을 많이 먹으러',
  '다니는 여행',
].join(LINE_BREAK);
const SUBTITLE = ['일정을 만들기 전에', '잘못 이해한 부분이 없는지 확인해주세요.'].join(
  LINE_BREAK,
);

export function InterpretationReviewScreen() {
  const navigation = useNavigation<Nav>();

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

      <View style={styles.content}>
        <Text style={styles.title}>이렇게 이해했어요</Text>
        <Text style={styles.subtitle}>{SUBTITLE}</Text>

        <View style={styles.summaryBox}>
          <Text style={styles.summary}>{MOCK_SUMMARY}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => navigation.navigate('PreferenceCorrection')}
          >
            <Text style={styles.actionText}>잘못 이해했어요</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => navigation.navigate('RegionCandidates')}
          >
            <Text style={styles.actionText}>제대로 이해했어요</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9F7F2',
  },
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 58,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    textAlign: 'center',
  },
  summaryBox: {
    width: '100%',
    marginTop: 38,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: '#A9AD70',
    borderRadius: 28,
    backgroundColor: '#E8E9D9',
    alignItems: 'center',
  },
  summary: {
    fontSize: 21,
    lineHeight: 27,
    color: '#111111',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    marginTop: 88,
    paddingBottom: 24,
    gap: 10,
  },
  actionButton: {
    width: '100%',
    minHeight: 72,
    borderWidth: 1,
    borderColor: '#A9AD70',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F7F2',
  },
  actionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111111',
  },
});
