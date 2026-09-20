import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePlanning } from '../../lib/planningStore';
import { colors, spacing } from '../../lib/theme';

export function ScheduleScreen() {
  const navigation = useNavigation<any>();
  const { plan, setDateRange } = usePlanning();

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0: 1월, 8: 9월

  const [startDate, setStartDate] = useState<Date | null>(
    plan?.dateRange?.start ? new Date(plan.dateRange.start) : null,
  );
  const [endDate, setEndDate] = useState<Date | null>(
    plan?.dateRange?.end ? new Date(plan.dateRange.end) : null,
  );

  // 경고 메시지 상태 (초기값 null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 달력 넘기기
  const changeMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // 날짜 클릭 처리 (최대 3일 제한)
  const handleDatePress = (day: number) => {
    const selected = new Date(currentYear, currentMonth, day);

    if (!startDate || (startDate && endDate)) {
      setStartDate(selected);
      setEndDate(null);
      setErrorMessage(null);
    } else if (startDate && !endDate) {
      if (selected < startDate) {
        setStartDate(selected);
        setErrorMessage(null);
      } else {
        const diffTime = Math.abs(selected.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays > 3) {
          // 3일 초과 시 에러 메시지 노출
          setErrorMessage('최대 3일까지 선택 가능합니다');
        } else {
          setEndDate(selected);
          setErrorMessage(null);
        }
      }
    }
  };

  // 날짜 선택 상태 확인
  const isSelected = (day: number) => {
    if (!day) return null;
    const target = new Date(currentYear, currentMonth, day).getTime();
    const start = startDate ? startDate.getTime() : null;
    const end = endDate ? endDate.getTime() : null;

    if (start && target === start) return 'start';
    if (end && target === end) return 'end';
    if (start && end && target > start && target < end) return 'inRange';
    return null;
  };

  // 달력 그리드 생성
  const renderCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const cells: { day: number; current: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, current: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, current: true });
    }
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, current: false });
    }

    return cells.map((cell, index) => {
      if (!cell.current) {
        return (
          <View key={`pad-${index}`} style={styles.dayCell}>
            <Text style={styles.paddingDayText}>{cell.day}</Text>
          </View>
        );
      }

      const day = cell.day;
      const status = isSelected(day);
      const isSingle =
        startDate &&
        !endDate &&
        startDate.getDate() === day &&
        startDate.getMonth() === currentMonth;

      return (
        <TouchableOpacity
          key={`day-${day}`}
          style={[
            styles.dayCell,
            status === 'inRange' && styles.inRangeDay,
            status === 'start' && endDate && styles.startDayRange,
            status === 'end' && styles.endDayRange,
          ]}
          activeOpacity={0.7}
          onPress={() => handleDatePress(day)}
        >
          <View
            style={[(status === 'start' || status === 'end' || isSingle) && styles.selectedCircle]}
          >
            <Text
              style={[
                styles.dayText,
                (status === 'start' || status === 'end' || isSingle) && styles.selectedDayText,
              ]}
            >
              {day}
            </Text>
          </View>
        </TouchableOpacity>
      );
    });
  };

  // 다음 버튼 클릭 처리
  const handleNext = () => {
    if (!startDate) return;

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate ? endDate.toISOString().split('T')[0] : startStr;

    if (setDateRange) {
      setDateRange({ start: startStr, end: endStr });
    }

    navigation.navigate('Companion');
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={28} color="#252725" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="home-outline" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* 타이틀 영역 (에러 발생 시 문구 교체 및 색상 변경) */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>언제 떠나요?</Text>
          <Text style={[styles.subTitle, errorMessage ? styles.errorText : null]}>
            {errorMessage || '여행 날짜를 알려주세요.'}
          </Text>
        </View>

        {/* 달력 카드 영역 */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarMonthText}>
              {currentYear}년 {currentMonth + 1}월
            </Text>
            <View style={styles.monthNavButtons}>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
                <Ionicons name="chevron-back" size={18} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton}>
                <Ionicons name="chevron-forward" size={18} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 요일 헤더 */}
          <View style={styles.weekHeader}>
            {weekDays.map((week, idx) => (
              <Text key={idx} style={[styles.weekText, idx === 0 && styles.sundayText]}>
                {week}
              </Text>
            ))}
          </View>

          {/* 일자 그리드 */}
          <View style={styles.daysGrid}>{renderCalendarDays()}</View>
        </View>

        {/* 하단 다음 버튼 */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={[styles.nextButton, !startDate && styles.disabledButton]}
            disabled={!startDate}
            activeOpacity={0.8}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>다음</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  errorText: {
    color: '#C05A46',
    fontWeight: '600',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginVertical: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  monthNavButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  arrowButton: {
    padding: 4,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekText: {
    fontSize: 13,
    color: '#777777',
    width: 36,
    textAlign: 'center',
    fontWeight: '500',
  },
  sundayText: {
    color: '#C05A46',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  paddingDayText: {
    fontSize: 15,
    color: '#CCCCCC',
  },
  selectedCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#23382B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inRangeDay: {
    backgroundColor: '#EAF2ED',
  },
  startDayRange: {
    backgroundColor: '#EAF2ED',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  endDayRange: {
    backgroundColor: '#EAF2ED',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  bottomButtonContainer: {
    marginBottom: 24,
  },
  nextButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#23382B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A3B0A7',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScheduleScreen;
