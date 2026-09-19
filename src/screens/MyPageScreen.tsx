import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useOnboarding } from '../lib/onboardingStore';
import { usePlanning } from '../lib/planningStore';
import { colors, spacing } from '../lib/theme';

export const MyPageScreen = () => {
  const navigation = useNavigation<any>();
  const { profile, savedTrips } = useOnboarding();
  const { reset } = usePlanning();

  const startPlanning = () => {
    reset();
    navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'Schedule' }] });
  };

  const editProfile = () => {
    navigation.navigate('EditProfile', {
      userInfo: {
        name: profile.name,
        gender: profile.gender === 'male' ? '남성' : '여성',
        birthYear: profile.birthYear,
      },
    });
  };

  const userName = profile.name ? `${profile.name} 님` : '승희 님';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 타이틀 */}
        <Text style={styles.headerTitle}>MY</Text>

        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={24} color="#23382B" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userRole}>OPTRIP 여행자</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={editProfile}>
            <Text style={styles.editProfileText}>프로필 수정</Text>
          </TouchableOpacity>
        </View>

        {/* 저장한 여행 섹션 */}
        <View style={styles.savedSection}>
          <Text style={styles.sectionTitle}>저장한 여행</Text>

          {savedTrips.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>저장된 여행이 없어요. 여행을 만들어볼까요?</Text>
              <TouchableOpacity
                style={styles.startButton}
                activeOpacity={0.85}
                onPress={startPlanning}
              >
                <Text style={styles.startButtonText}>여행 시작하기</Text>
                <Ionicons name="chevron-forward" size={18} color="#23382B" />
              </TouchableOpacity>
            </View>
          ) : (
            savedTrips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('CourseDetail', {
                    courseIndex: 0,
                    savedTripId: trip.id,
                    savedCourse: trip.course,
                    savedRegionName: trip.regionName,
                  })
                }
              >
                <ImageBackground
                  source={{ uri: trip.image }}
                  style={styles.cardBackground}
                  imageStyle={{ borderRadius: 20, opacity: 0.85 }}
                >
                  <Text style={styles.tripTitle}>{trip.title}</Text>
                  <Text style={styles.tripDesc}>{trip.desc}</Text>
                </ImageBackground>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* 하단 네비게이션 바 */}
      <View style={styles.bottomNav}>
        {/* 좌측 */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={24} color="#777777" />
          <Text style={styles.navLabel}>홈</Text>
        </TouchableOpacity>

        {/* 중앙 */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={startPlanning}>
          <Ionicons name="compass-outline" size={24} color="#777777" />
          <Text style={styles.navLabel}>여행 시작하기</Text>
        </TouchableOpacity>

        {/* 우측 */}
        <TouchableOpacity style={styles.navItem} activeOpacity={1}>
          <View style={styles.activeIconBg}>
            <Ionicons name="person" size={22} color="#23382B" />
          </View>
          <Text style={[styles.navLabel, styles.navLabelActive]}>MY</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background || '#F9F8F4',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingX || 20,
    paddingTop: 24,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 36,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF2ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: '#777777',
  },
  editProfileText: {
    fontSize: 12,
    color: '#666666',
    alignSelf: 'flex-end',
  },
  savedSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyContainer: {
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  startButton: {
    height: 52,
    backgroundColor: '#F3F2EB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#23382B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#23382B',
  },
  card: {
    height: 180,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: colors.cardDefault || '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.divider || '#EEEEEE',
    overflow: 'hidden',
  },
  cardBackground: {
    flex: 1,
    padding: 25,
    justifyContent: 'space-between',
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary || '#1A1A1A',
  },
  tripDesc: {
    fontSize: 14,
    color: colors.textPrimary || '#1A1A1A',
    marginTop: 5,
    fontWeight: '600',
  },
  bottomNav: {
    height: 68,
    backgroundColor: '#F9F8F4',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeIconBg: {
    width: 36,
    height: 28,
    backgroundColor: '#EAF2ED',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 11,
    color: '#777777',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#23382B',
    fontWeight: 'bold',
  },
});

export default MyPageScreen;
