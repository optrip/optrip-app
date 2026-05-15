import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const BUDGET_OPTIONS = [
  { id: '1', label: '10만원 이하', value: '0-10' },
  { id: '2', label: '10만원 ~ 50만원', value: '10-50' },
  { id: '3', label: '50만원 ~ 100만원', value: '50-100' },
  { id: '4', label: '100만원 이상', value: '100+' },
];

export const BudgetScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="black" />
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.questionText}>예산이 얼마인가요?</Text>
        
        <View style={styles.optionsContainer}>
          {BUDGET_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedId === option.id && styles.selectedOption
              ]}
              onPress={() => setSelectedId(option.id)}
            >
              <Text style={[
                styles.optionText,
                selectedId === option.id && styles.selectedOptionText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 하단 버튼 */}
        <TouchableOpacity 
          style={[styles.nextButton, !selectedId && styles.disabledButton]}
          onPress={() => selectedId && alert('일정정보 화면으로 연결 예정..')}
          disabled={!selectedId}
        >
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton}>
          <Text style={styles.skipButtonText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  backButton: { padding: 20 },
  container: { flex: 1, paddingHorizontal: 30, alignItems: 'center', paddingTop: 50 },
  questionText: { fontSize: 26, fontWeight: 'bold', marginBottom: 60 },
  optionsContainer: { width: '100%', marginBottom: 40 },
  optionButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 15,
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  optionText: { fontSize: 18, color: '#64748B' },
  selectedOptionText: { color: '#3B82F6', fontWeight: 'bold' },
  nextButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: { backgroundColor: '#CBD5E1' },
  nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  skipButton: { marginTop: 25 },
  skipButtonText: { color: '#94A3B8', fontSize: 16, textDecorationLine: 'underline' },
});