import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useOnboarding } from '../lib/onboardingStore';
import { usePlanning } from '../lib/planningStore';
import type { OnboardingStackParamList } from '../navigation/types';

const LOGO = require('../../assets/logo/optrip-small.png');

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Home'>;

export const HomeScreen = () => {
  const { profile } = useOnboarding();
  const { reset } = usePlanning();
  const navigation = useNavigation<Nav>();

  const startPlanning = () => {
    reset(); // 새 계획 시작 시 이전 추천/제외 지역/코스 초기화
    navigation.navigate('Budget');
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>{profile.name}님, 안녕하세요</Text>

        <View style={styles.mainCard}>
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
            }}
            style={styles.cardBackground}
            imageStyle={{ borderRadius: 30, opacity: 0.4 }}
          >
            <Text style={styles.cardTitle}>어디로{'\n'}가 볼까요?</Text>

            <TouchableOpacity style={styles.actionButton} onPress={startPlanning}>
              <Text style={styles.buttonText}>계획 세우기</Text>
              <Ionicons name="chevron-forward" size={20} color="black" />
            </TouchableOpacity>
          </ImageBackground>
        </View>
      </View>

      <View style={styles.bottomBar}>
        {/* 가방 버튼: 터치하면 내 여행 화면으로 이동 */}
        <TouchableOpacity onPress={() => navigation.navigate('MyTrips')}>
          <Ionicons name="briefcase-outline" size={28} color="#ccc" />
        </TouchableOpacity>

        {/* 홈 버튼: 현재 화면 표시 (파란색) */}
        <View style={styles.mainMarker}>
          <Ionicons name="location" size={40} color="#3B82F6" />
        </View>

        {/* 마이페이지는 일단 생략 */}
        <View>
          <Ionicons name="person-outline" size={28} color="#ccc" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 40 },
  logoImage: { width: 78, height: 30 },
  content: { flex: 1, paddingHorizontal: 25, paddingTop: 40 },
  welcomeText: { fontSize: 22, fontWeight: '600', marginBottom: 30 },
  mainCard: {
    height: 400,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
  },
  cardBackground: { flex: 1, padding: 30, justifyContent: 'space-between' },
  cardTitle: { fontSize: 32, fontWeight: 'bold', lineHeight: 45 },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonText: { fontSize: 18, fontWeight: '600' },
  bottomBar: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: 20,
  },
  mainMarker: {
    marginTop: -40,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 10,
    elevation: 5,
  },
});
