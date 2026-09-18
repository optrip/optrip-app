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
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePlanning } from '../../lib/planningStore';
import { colors, spacing } from '../../lib/theme';

// 임시 여행지 추천 데이터 (연관 검색어용)
const MOCK_LOCATIONS = [
  '가평', '강릉', '강화도', '거제', '거창', '경주', '경산',
  '광주', '구례', '군산', '남해', '단양', '대구', '대전',
  '동해', '목포', '부산', '부여', '속초', '수원', '여수',
  '용인', '울릉도', '울산', '인천', '전주', '제주도', '춘천',
  '통영', '평창', '포항',
];

// 빠른 선택 지역 목록
const QUICK_LOCATIONS = ['강릉', '경주', '부산', '전주'];

export function DestinationScreen() {
  const navigation = useNavigation<any>();
  
  // 타입 에러 방지를 위해 any 타입 단서 적용
  const planningStore = usePlanning() as any;

  // 목적지 검색 상태
  const [inputText, setInputText] = useState('');
  const [destinations, setDestinations] = useState<string[]>(
    planningStore?.plan?.destinations || []
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // 출발지 관련 상태 ('manual': 직접 입력, 'current': 현재 위치 사용)
  const [departureMode, setDepartureMode] = useState<'current' | 'manual'>('manual');
  const [departureText, setDepartureText] = useState('');

  // 텍스트 입력 시 연관 검색어 필터링
  const handleTextChange = (text: string) => {
    setInputText(text);
    if (text.trim().length > 0) {
      const filtered = MOCK_LOCATIONS.filter(
        (loc) => loc.includes(text) && !destinations.includes(loc)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // 목적지 추가 (최대 3개)
  const handleAddDestination = (place?: string) => {
    if (destinations.length >= 3) return;

    const newPlace = place ? place.trim() : inputText.trim();
    if (!newPlace) return;

    if (!destinations.includes(newPlace)) {
      setDestinations([...destinations, newPlace]);
    }

    setInputText('');
    setSuggestions([]);
  };

  // 목적지 삭제
  const handleRemoveDestination = (index: number) => {
    const newDestinations = [...destinations];
    newDestinations.splice(index, 1);
    setDestinations(newDestinations);
  };

  // 다음 화면 이동
  const handleNext = () => {
    if (typeof planningStore?.setDestinations === 'function') {
      planningStore.setDestinations(destinations);
    }
    navigation.navigate('WantToDo');
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

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* 타이틀 영역 */}
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>어디로 가고 싶나요?</Text>
              <Text
                style={[
                  styles.subTitle,
                  destinations.length >= 3 && styles.errorSubTitle,
                ]}
              >
                {destinations.length >= 3
                  ? '후보는 세 개까지만 입력 가능해요.'
                  : '아직 정하지 못했다면 넘어가셔도 괜찮아요.'}
              </Text>
            </View>

            {/* 선택된 목적지 태그(칩) 목록 */}
            {destinations.length > 0 && (
              <View style={styles.chipWrapper}>
                {destinations.map((dest, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.chip}
                    activeOpacity={0.7}
                    onPress={() => handleRemoveDestination(index)}
                  >
                    <Text style={styles.chipText}>{dest}</Text>
                    <Ionicons name="close" size={14} color="#23382B" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 1. 지역 또는 장소 검색 입력창 */}
            <View style={styles.searchSection}>
              <View style={styles.inputCard}>
                <TextInput
                  style={styles.textInput}
                  placeholder="지역 또는 장소 검색"
                  placeholderTextColor="#AAAAAA"
                  value={inputText}
                  onChangeText={handleTextChange}
                  onSubmitEditing={() => handleAddDestination()}
                  editable={destinations.length < 3}
                  returnKeyType="search"
                />
                <TouchableOpacity
                  onPress={() => handleAddDestination()}
                  disabled={destinations.length >= 3 || !inputText.trim()}
                >
                  <Ionicons name="search-outline" size={20} color="#333333" />
                </TouchableOpacity>
              </View>

              {/* 연관 검색어 드롭다운 */}
              {suggestions.length > 0 && (
                <View style={styles.dropdownContainer}>
                  <FlatList
                    data={suggestions}
                    keyExtractor={(item, index) => index.toString()}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleAddDestination(item)}
                      >
                        <Ionicons name="location-outline" size={16} color="#888888" style={{ marginRight: 8 }} />
                        <Text style={styles.dropdownText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>

            {/* 2. 지역 바로 선택 */}
            <View style={styles.quickSection}>
              <Text style={styles.sectionLabel}>지역 바로 선택</Text>
              <View style={styles.quickButtonsRow}>
                {QUICK_LOCATIONS.map((loc) => {
                  const isSelected = destinations.includes(loc);
                  return (
                    <TouchableOpacity
                      key={loc}
                      style={[
                        styles.quickButton,
                        isSelected && styles.quickButtonSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleAddDestination(loc)}
                      disabled={destinations.length >= 3 && !isSelected}
                    >
                      <Text
                        style={[
                          styles.quickButtonText,
                          isSelected && styles.quickButtonTextSelected,
                        ]}
                      >
                        {loc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 3. 출발지 선택 영역 */}
            <View style={styles.departureSection}>
              <View style={styles.departureHeader}>
                <Text style={styles.departureTitle}>출발지</Text>
                <Text style={styles.departureSubtitle}>
                  입력하지 않아도 여행을 만들 수 있어요.
                </Text>
              </View>

              {/* 출발지 방식 선택 토글 버튼 */}
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    departureMode === 'current' && styles.toggleButtonActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setDepartureMode('current')}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      departureMode === 'current' && styles.toggleTextActive,
                    ]}
                  >
                    현재 위치 사용
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    departureMode === 'manual' && styles.toggleButtonActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setDepartureMode('manual')}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      departureMode === 'manual' && styles.toggleTextActive,
                    ]}
                  >
                    직접 입력
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 출발지 직접 입력창 */}
              {departureMode === 'manual' && (
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="출발 지역 또는 주소 입력"
                    placeholderTextColor="#AAAAAA"
                    value={departureText}
                    onChangeText={setDepartureText}
                    returnKeyType="done"
                  />
                  <Ionicons name="search-outline" size={20} color="#333333" />
                </View>
              )}
            </View>
          </ScrollView>

          {/* 하단 다음 버튼 */}
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={styles.nextButton}
              activeOpacity={0.8}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>다음</Text>
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
  scrollContent: {
    paddingBottom: 20,
  },
  titleSection: {
    marginVertical: 12,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: '#666666',
  },
  errorSubTitle: {
    color: '#C05A46',
    fontWeight: '600',
  },
  chipWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF2ED',
    borderWidth: 1,
    borderColor: '#23382B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2A23',
  },
  searchSection: {
    position: 'relative',
    zIndex: 20,
    marginBottom: 24,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    marginRight: 8,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    maxHeight: 180,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333333',
  },
  quickSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 10,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  quickButtonSelected: {
    backgroundColor: '#EAF2ED',
    borderColor: '#23382B',
  },
  quickButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  quickButtonTextSelected: {
    fontWeight: 'bold',
    color: '#1F2A23',
  },
  departureSection: {
    marginBottom: 20,
  },
  departureHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  departureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  departureSubtitle: {
    fontSize: 12,
    color: '#777777',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  toggleButtonActive: {
    borderColor: '#23382B',
    borderWidth: 1.5,
  },
  toggleText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#1A1A1A',
    fontWeight: 'bold',
  },
  bottomButtonContainer: {
    marginBottom: 24,
    marginTop: 8,
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

export default DestinationScreen;