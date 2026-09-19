import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../lib/theme';

export const IntroScreen = () => {
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

  const handlePressStart = () => {
    const useNative = Platform.OS !== 'web';
    Animated.timing(opacity, {
      toValue: 0,
      duration: 400, // 페이드 아웃 지속 시간
      useNativeDriver: useNative,
    }).start(({ finished }) => {
      if (finished) {
        navigation.navigate('Welcome');
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity }]}>
        {/* 상단 빈 공간 */}
        <View style={styles.header} />

        {/* 중앙 메인 텍스트 영역 */}
        <View style={styles.mainSection}>
          <Text style={styles.mainTitle}>환영합니다</Text>
          <Text style={styles.subTitle}>
            어디로 갈지 몰라도 괜찮아요.{'\n'}
            원하는 여행을 말하면 함께 좁혀드릴게요.
          </Text>
        </View>

        {/* 하단 안내 문구 및 시작하기 버튼 */}
        <View style={styles.bottomSection}>
          <Text style={styles.captionText}>원하는 여행을 바로 시작해보세요.</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={handlePressStart}
          >
            <Text style={styles.primaryButtonText}>시작하기</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#F9F8F4',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingX || 24,
    paddingTop: 12,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  header: {
    height: 36,
  },
  mainSection: {
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  captionText: {
    fontSize: 12,
    color: '#777777',
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
});

export default IntroScreen;
