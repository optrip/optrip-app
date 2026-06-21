import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../lib/onboardingStore';

export default function MyPageScreen({ navigation }: any) {
  const { profile } = useOnboarding();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>OpTrip</Text>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.userName}>{profile.name} 님</Text>
          <Text style={styles.userMeta}>
            {profile.name} · {profile.gender} · {profile.birthYear}년생
          </Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('EditProfile', { userInfo: profile })}
          >
            <Text style={styles.menuText}>내 정보 수정하기</Text>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomBar}>
          {/* 가방 버튼: 터치하면 내 여행 화면으로 이동 */}
          <TouchableOpacity onPress={() => navigation.navigate('MyTrips')}>
            <Ionicons name="briefcase-outline" size={28} color="#ccc" />
          </TouchableOpacity>

          {/* 홈 버튼: 터치하면 홈 화면으로 이동 */}
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <View style={styles.mainMarkerContainer}>
              <Ionicons name="location" size={40} color="#ccc" />
            </View>
          </TouchableOpacity>

          {/* 마이페이지 버튼: 현재 화면 표시 (파란색 활성화) */}
          <TouchableOpacity onPress={() => navigation.navigate('MyPage')}>
            <Ionicons name="person" size={28} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'space-between' },
  header: { height: 60, justifyContent: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  profileSection: { alignItems: 'center', paddingVertical: 40 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  userMeta: { fontSize: 14, color: '#888' },
  menuSection: { paddingHorizontal: 20, marginTop: 20, flex: 1 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  menuText: { fontSize: 16, color: '#000', fontWeight: '500' },
  
  // 하단 바 스타일 이식
  bottomBar: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  mainMarkerContainer: {
    marginTop: -40,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
  },
});