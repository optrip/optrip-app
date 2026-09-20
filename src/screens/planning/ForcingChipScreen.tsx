import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePlanning } from '../../lib/planningStore';
import type { Preference } from '../../navigation/types';

const PREFERENCES: { id: Preference; label: string; icon: string }[] = [
  { id: 'sea', label: '바다', icon: 'boat-outline' },
  { id: 'hiking', label: '하이킹·트레킹', icon: 'walk-outline' },
  { id: 'food', label: '맛집', icon: 'restaurant-outline' },
  { id: 'history', label: '역사·문화', icon: 'landmark-outline' },
  { id: 'nightview', label: '야경', icon: 'moon-outline' },
  { id: 'activity', label: '액티비티', icon: 'fitness-outline' },
  { id: 'nature', label: '자연·풍경', icon: 'sunny-outline' },
  { id: 'healing', label: '힐링', icon: 'flower-outline' },
  { id: 'cafe', label: '카페 투어', icon: 'cafe-outline' },
  { id: 'market', label: '시장·먹거리', icon: 'basket-outline' },
  { id: 'culture', label: '문화 체험', icon: 'color-palette-outline' },
  { id: 'photo', label: '감성·사진', icon: 'camera-outline' },
];

export default function PreferenceScreen() {
  const navigation = useNavigation<any>();
  const { plan, setPreferences } = usePlanning();
  const [selectedItems, setSelectedItems] = useState<Preference[]>(plan.preferences);

  const handleToggle = (preference: Preference) => {
    if (selectedItems.includes(preference)) {
      setSelectedItems(selectedItems.filter((item) => item !== preference));
    } else {
      if (selectedItems.length >= 3) return; // 최대 3개 제한
      setSelectedItems([...selectedItems, preference]);
    }
  };

  const handleNext = () => {
    setPreferences(selectedItems);
    navigation.navigate('Loading');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* 상단 헤더 & 프로그래스 바 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="#252725" />
          </TouchableOpacity>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '60%' }]} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 타이틀 영역 */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>원하는 여행을 골라주세요</Text>
            <Text style={styles.subTitle}>최대 3개까지 고를 수 있어요</Text>
          </View>

          {/* 칩 그리드 영역 */}
          <View style={styles.gridContainer}>
            {PREFERENCES.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.chipCard, isSelected && styles.selectedChipCard]}
                  onPress={() => handleToggle(item.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={isSelected ? '#333' : '#666'}
                    style={styles.chipIcon}
                  />
                  <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* 하단 다음 버튼 */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>다음</Text>
            <Ionicons name="chevron-forward" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F8F4',
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
  },
  header: {
    paddingTop: 10,
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 15,
    marginLeft: -5,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: '#E5E3D7',
    borderRadius: 2,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7C885B',
    borderRadius: 2,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  chipCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E3D7',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  selectedChipCard: {
    backgroundColor: '#D1D7C4', // 선택되었을 때의 카키빛 배경색
    borderColor: '#B8C2A7',
  },
  chipIcon: {
    marginBottom: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  selectedChipText: {
    fontWeight: '600',
    color: '#111',
  },
  bottomButtonContainer: {
    paddingVertical: 15,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#E8E8DA',
    borderColor: '#C7C6B8',
    borderWidth: 1,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});
