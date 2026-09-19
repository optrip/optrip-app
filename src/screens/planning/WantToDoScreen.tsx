import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePlanning } from '../../lib/planningStore';
import { colors, spacing } from '../../lib/theme';

const PRESETS = ['조용히 쉬기', '먹으러 다니기', '자연 속 걷기'];

export function WantToDoScreen() {
  const navigation = useNavigation<any>();
  const planningStore = usePlanning() as any;
  const [content, setContent] = useState(planningStore?.plan?.wantToDo || '');

  // 추천 문구 버튼 클릭 시 입력란에 적용
  const handlePresetSelect = (presetText: string) => {
    setContent(presetText);
  };

  const handleNext = () => {
    if (typeof planningStore?.setWantToDo === 'function') {
      planningStore.setWantToDo(content);
    }

    navigation.navigate('Loading');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* 상단 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="home-outline" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          {/* 메인 콘텐츠 영역 */}
          <View style={styles.content}>
            {/* 타이틀 영역 */}
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>이번 여행에서는{'\n'}어떤 하루를 보내고 싶나요?</Text>
              <Text style={styles.subTitle}>
                장소 이름이 아니라 원하는 느낌이나{'\n'}하고 싶은 일을 말해도 돼요.
              </Text>
            </View>

            {/* 텍스트 입력 카드 박스 */}
            <View style={[styles.inputCard, content.length > 0 && styles.inputCardActive]}>
              <TextInput
                style={styles.textInput}
                placeholder={'바다 보면서 천천히 걷고,\n맛있는 것도 많이 먹고 싶어요.'}
                placeholderTextColor="#AAAAAA"
                multiline={true}
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
              />
            </View>

            {/* 추천 프리셋 버튼 영역 */}
            <View style={styles.presetSection}>
              <Text style={styles.presetTitle}>이렇게 시작해도 좋아요</Text>
              <View style={styles.presetRow}>
                {PRESETS.map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.presetButton, content === preset && styles.presetButtonSelected]}
                    activeOpacity={0.8}
                    onPress={() => handlePresetSelect(preset)}
                  >
                    <Text
                      style={[
                        styles.presetButtonText,
                        content === preset && styles.presetButtonTextSelected,
                      ]}
                    >
                      {preset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* 하단 다음 버튼 */}
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity style={styles.nextButton} activeOpacity={0.85} onPress={handleNext}>
              <Text style={styles.nextButtonText}>이해한 내용 확인하기</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background || '#F9F8F4',
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingX || 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerButton: {
    padding: 4,
  },
  backText: {
    fontSize: 28,
    color: '#333333',
    lineHeight: 28,
    fontWeight: '300',
  },
  content: {
    flex: 1,
  },
  titleSection: {
    marginVertical: 12,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    lineHeight: 32,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    height: 180,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    marginTop: 16,
    marginBottom: 24,
  },
  inputCardActive: {
    borderColor: '#23382B',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  presetSection: {
    marginTop: 4,
  },
  presetTitle: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  presetButtonSelected: {
    backgroundColor: '#EAF2ED',
    borderColor: '#23382B',
  },
  presetButtonText: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
  },
  presetButtonTextSelected: {
    fontWeight: 'bold',
    color: '#1F2A23',
  },
  bottomButtonContainer: {
    marginBottom: 24,
    marginTop: 12,
  },
  nextButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#23382B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WantToDoScreen;
