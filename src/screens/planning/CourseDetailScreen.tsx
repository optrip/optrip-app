import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePlanning } from '../../lib/planningStore';
import { useOnboarding } from '../../lib/onboardingStore';

export function CourseDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { plan } = usePlanning();
  const { saveTrip } = useOnboarding();

  // 현재 코스 정보 가져오기 (기존 로직 유지)
  const courseIndex = route.params?.courseIndex ?? 0;
  const course = plan.courses?.courses[courseIndex];
  const regionName = plan.courses?.regionName ?? '여행지';

  // [경로 저장] 버튼 로직
  const onSave = () => {
    if (!course) {
      Alert.alert('오류', '코스 정보를 찾을 수 없습니다.');
      return;
    }

    saveTrip({
      title: `${regionName} ${course.purpose} 코스`,
      desc: `${course.days.length}일 코스`,
      image: 'https://picsum.photos/800/600', // 추후 실제 이미지로 변경 가능
    });

    Alert.alert('저장 완료', '내 여행 화면에 코스가 저장되었습니다!');
  };

  if (!course) return <Text>코스를 불러올 수 없습니다.</Text>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>{regionName} {course.purpose} 코스</Text>
        <Text style={styles.subtitle}>{course.days.length}일 일정</Text>
        
        <View style={styles.body}>
          <Text>{course.summary}</Text>
        </View>
      </ScrollView>

      {/* 하단 저장 버튼 */}
      <View style={styles.bottom}>
        <Pressable style={styles.saveBtn} onPress={onSave}>
          <Ionicons name="bookmark-outline" size={24} color="#fff" />
          <Text style={styles.saveText}>경로 저장</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20 },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  body: { paddingVertical: 10 },
  bottom: { padding: 20, borderTopWidth: 1, borderColor: '#eee' },
  saveBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#3B82F6', 
    padding: 15, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 8 
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});