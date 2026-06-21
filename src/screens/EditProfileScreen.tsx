import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../lib/onboardingStore';

export default function EditProfileScreen({ route, navigation }: any) {
  const { setName, setGender, setBirthYear } = useOnboarding();

  const initialInfo = route.params?.userInfo || { name: '홍길동', gender: '남성', birthYear: '2000' };
  const [name, setNameInput] = useState(initialInfo.name);
  const [gender, setGenderInput] = useState(initialInfo.gender);
  const [birthYear, setBirthYearInput] = useState(initialInfo.birthYear);
  const [isFormChanged, setIsFormChanged] = useState(false);

  useEffect(() => {
    setIsFormChanged(name !== initialInfo.name || gender !== initialInfo.gender || birthYear !== initialInfo.birthYear);
  }, [name, gender, birthYear]);

  const handleSave = () => {
    setName(name);
    setGender(gender);
    setBirthYear(birthYear);

    alert('저장되었습니다!');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.navBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={24} color="#000" /></TouchableOpacity>
            <Text style={styles.navTitle}>내 정보 수정하기</Text><View style={{ width: 24 }} />
          </View>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이름</Text>
              <TextInput style={styles.input} value={name} onChangeText={setNameInput} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>성별</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity style={[styles.genderButton, gender === '남성' ? styles.activeGender : styles.inactiveGender]} onPress={() => setGenderInput('남성')}>
                  <Text style={[styles.genderText, gender === '남성' ? styles.activeText : styles.inactiveText]}>남성</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.genderButton, gender === '여성' ? styles.activeGender : styles.inactiveGender]} onPress={() => setGenderInput('여성')}>
                  <Text style={[styles.genderText, gender === '여성' ? styles.activeText : styles.inactiveText]}>여성</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>태어난 연도</Text>
              <TextInput style={styles.input} value={birthYear} onChangeText={setBirthYearInput} keyboardType="numeric" />
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.saveButton, isFormChanged ? styles.saveButtonActive : styles.saveButtonInactive]} 
            disabled={!isFormChanged} 
            onPress={handleSave}
          >
            <Text style={[styles.saveButtonText, isFormChanged ? styles.textActive : styles.textInactive]}>저장하기</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, justifyContent: 'space-between', paddingBottom: 30 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  navTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  formContainer: { flex: 1, paddingHorizontal: 25, paddingTop: 30 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  input: { height: 50, backgroundColor: '#f0f0f0', borderRadius: 12, paddingHorizontal: 15, fontSize: 16 },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  genderButton: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  activeGender: { backgroundColor: '#1A91FF' },
  inactiveGender: { backgroundColor: '#e8e8e8' },
  genderText: { fontSize: 16, fontWeight: '600' },
  activeText: { color: '#fff' },
  inactiveText: { color: '#666' },
  saveButton: { height: 55, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginHorizontal: 25 },
  saveButtonActive: { backgroundColor: '#0084FF' },
  saveButtonInactive: { backgroundColor: '#e8e8e8' },
  saveButtonText: { fontSize: 18, fontWeight: 'bold' },
  textActive: { color: '#fff' },
  textInactive: { color: '#aaa' },
});