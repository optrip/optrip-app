import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const DUMMY_TRIPS = [
  {
    id: 'jeju',
    title: '제주도',
    desc: '3월 30일 ~ 4월 2일 · 혼자 · 50만원 · 여유로운',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
  },
  {
    id: 'gyeongju',
    title: '경주',
    desc: '3박 4일 · 가족과 · 100만원 · 역사적인',
    image: 'https://images.unsplash.com/photo-1590660309054-d4f19904269e?w=800',
  },
  {
    id: 'mokpo',
    title: '목포',
    desc: '3박 4일 · 가족과 · 100만원 · 역사적인',
    image: 'https://images.unsplash.com/photo-1594191316043-f66710b7431e?w=800',
  },
];

export const MyTripsScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 로고 */}
      <View style={styles.header}>
        <Text style={styles.logoText}>OpTrip</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.titleText}>내가 저장한 여행</Text>

        {DUMMY_TRIPS.map((trip) => (
          <View key={trip.id} style={styles.card}>
            {/* (이미지가 안떠요..) */}
            <ImageBackground
              source={{ uri: trip.image }}
              style={styles.cardBackground}
              imageStyle={{ borderRadius: 25, opacity: 0.8 }}
            >
              <View>
                <Text style={styles.tripTitle}>{trip.title}</Text>
                <Text style={styles.tripDesc}>{trip.desc}</Text>
              </View>

              <View style={styles.detailButton}>
                <Text style={styles.detailText}>상세 보기</Text>
                <Ionicons name="chevron-forward" size={14} color="#444" />
              </View>
            </ImageBackground>
          </View>
        ))}
        {/* 아래쪽 여백용 */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 하단 바 */}
      <View style={styles.bottomBar}>
        <View>
          <Ionicons name="briefcase" size={28} color="#3B82F6" />
        </View>
        <TouchableOpacity style={styles.mainMarker} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="location-outline" size={35} color="#ccc" />
        </TouchableOpacity>
        <View>
          <Ionicons name="person-outline" size={28} color="#ccc" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 60 },
  logoText: { fontSize: 24, fontWeight: '900', color: '#000', letterSpacing: -0.5 },
  content: { flex: 1, paddingHorizontal: 25 },
  titleText: { fontSize: 26, fontWeight: 'bold', marginTop: 30, marginBottom: 20 },
  card: {
    height: 180,
    marginBottom: 20,
    borderRadius: 25,
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  cardBackground: { flex: 1, padding: 25, justifyContent: 'space-between' },
  tripTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  tripDesc: { fontSize: 14, color: '#000', marginTop: 5, fontWeight: '600' },
  detailButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  detailText: { fontSize: 12, fontWeight: '600', marginRight: 5 },
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
    padding: 12,
    elevation: 5,
  },
});
