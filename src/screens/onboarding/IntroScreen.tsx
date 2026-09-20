import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../lib/theme';

export function IntroScreen() {
  const navigation = useNavigation<any>();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: useNative,
    }).start();
  }, [opacity]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View style={[styles.content, { opacity }]}>
        {/* 상단 헤더 영역 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>OPTRIP 소개</Text>
        </View>

        {/* 본문 타이틀 & 세부 설명 */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>AI가 여행을 대신 정하지 않아요</Text>
          <Text style={styles.subtitle}>
            당신이 원하는 여행을 이해하고,{'\n'}
            실제 관광지 후보를 보여주고,{'\n'}
            직접 고른 장소로 일정을 조립합니다.
          </Text>
        </View>

        {/* 서비스 단계 안내 카드 리스트 */}
        <View style={styles.cardList}>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>01</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>말해요</Text>
              <Text style={styles.cardDesc}>어떤 하루를 원하는지</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardNumber}>02</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>확인해요</Text>
              <Text style={styles.cardDesc}>어떻게 이해했는지</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardNumber}>03</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>고르고 만들어요</Text>
              <Text style={styles.cardDesc}>지역 · 장소 · 일정을 직접</Text>
            </View>
          </View>
        </View>

        {/* 하단 버튼 및 안내 캡션 */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('NameInput')}
          >
            <Text style={styles.primaryButtonText}>내 정보 설정하기</Text>
          </TouchableOpacity>
          <Text style={styles.captionText}>프로필은 추천을 위한 필수 조건이 아닙니다.</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors?.background || '#F9F8F4',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing?.screenPaddingX || 24,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555555',
  },
  cardList: {
    gap: 12,
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888888',
    width: 32,
  },
  cardTextContainer: {
    marginLeft: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: '#777777',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#23382B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  captionText: {
    fontSize: 12,
    color: '#888888',
  },
});

export default IntroScreen;
