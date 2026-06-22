import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../lib/onboardingStore';

const LOGO = require('../../assets/logo/optrip-small.png');

export const MyTripsScreen = () => {
  const navigation = useNavigation<any>();
  const { savedTrips } = useOnboarding(); // 실제 데이터 가져오기

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.titleText}>내가 저장한 여행</Text>

        {savedTrips.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>아직 저장한 여행이 없어요.</Text>
        ) : (
          savedTrips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('CourseDetail', {
                  courseIndex: 0,
                  savedCourse: trip.course,
                  savedRegionName: trip.regionName,
                })
              }
            >
              <ImageBackground
                source={{ uri: trip.image }}
                style={styles.cardBackground}
                imageStyle={{ borderRadius: 25, opacity: 0.8 }}
              >
                <Text style={styles.tripTitle}>{trip.title}</Text>
                <Text style={styles.tripDesc}>{trip.desc}</Text>
              </ImageBackground>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

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
  logoImage: { width: 78, height: 30 },
  content: { flex: 1, paddingHorizontal: 25 },
  titleText: { fontSize: 26, fontWeight: 'bold', marginTop: 30, marginBottom: 20 },
  card: { height: 180, marginBottom: 20, borderRadius: 25, backgroundColor: '#eee', overflow: 'hidden' },
  cardBackground: { flex: 1, padding: 25, justifyContent: 'space-between' },
  tripTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  tripDesc: { fontSize: 14, color: '#000', marginTop: 5, fontWeight: '600' },
  
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