import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { PrimaryButton } from '../../components/PrimaryButton';
import { useOnboarding } from '../../lib/onboardingStore';
import { colors, spacing } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'BirthYear'>;

const CURRENT_YEAR = 2026;
const YEARS = Array.from({ length: CURRENT_YEAR - 1950 + 1 }, (_, i) => String(1950 + i));

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export function BirthYearScreen() {
  const navigation = useNavigation<Nav>();
  const { profile, setBirthYear } = useOnboarding();
  
  // 기존 설정값이 있으면 해당 값, 없으면 2006년을 기본값으로 사용
  const initialYear = profile.birthYear && YEARS.includes(profile.birthYear) ? profile.birthYear : '2006';
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);

  const flatListRef = useRef<FlatList>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: useNative,
    }).start();
  }, [opacity]);

  // 초기 스크롤 위치 설정
  const initialIndex = YEARS.indexOf(initialYear);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < YEARS.length) {
      const year = YEARS[index];
      if (year !== selectedYear) {
        setSelectedYear(year);
      }
    }
  };

  const submit = () => {
    if (!selectedYear) return;
    setBirthYear(selectedYear);
    
    
    navigation.navigate('Home' as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Animated.View style={[styles.flex, { opacity }]}>
        {/* 헤더 영역 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>기본 정보 · 선택</Text>
        </View>

        {/* 본문 영역 */}
        <View style={styles.body}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>출생연도를 알려주세요</Text>
            <Text style={styles.subtitle}>
              나중에 프로필에서 수정할 수 있어요.
            </Text>
          </View>

          {/* 연도 피커 카운터 박스 */}
          <View style={styles.pickerContainer}>
            {/* 선택 영역 하이라이트 배경 */}
            <View style={styles.selectionHighlight} pointerEvents="none" />

            <FlatList
              ref={flatListRef}
              data={YEARS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              contentContainerStyle={{
                paddingVertical: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
              }}
              renderItem={({ item }) => {
                const isSelected = item === selectedYear;
                return (
                  <TouchableOpacity
                    style={styles.pickerItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      const idx = YEARS.indexOf(item);
                      flatListRef.current?.scrollToIndex({ index: idx, animated: true });
                      setSelectedYear(item);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        isSelected && styles.pickerItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>

        {/* 하단 완료 버튼 */}
        <View style={styles.footer}>
          <PrimaryButton
            label="완료"
            onPress={submit}
            disabled={!selectedYear}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background || '#F9F8F4',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.md,
  },
  backButton: {
    paddingRight: 6,
    paddingVertical: 2,
  },
  backText: {
    fontSize: 28,
    color: '#333333',
    lineHeight: 28,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginLeft: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.lg,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary || '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary || '#666666',
  },
  pickerContainer: {
    height: PICKER_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    position: 'relative',
    overflow: 'hidden',
    marginTop: 10,
  },
  selectionHighlight: {
    position: 'absolute',
    top: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
    left: 12,
    right: 12,
    height: ITEM_HEIGHT,
    backgroundColor: '#EAF2ED',
    borderRadius: 12,
    zIndex: 0,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  pickerItemText: {
    fontSize: 16,
    color: '#888888',
    fontWeight: '400',
  },
  pickerItemTextSelected: {
    fontSize: 18,
    color: '#1F2A23',
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});