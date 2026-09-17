import { useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getPlaceDisplayTitle } from '../../api/places';
import {
  getPlanningDays,
  MAX_PLACES_PER_DAY,
  moveScheduledPlace,
  reconcilePlaceDays,
} from '../../lib/placeSchedule';
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'SelectionReview'>;
type Slot = { view: View; day: number; index: number; id?: string };
type Target = { day: number; index: number };
type MeasuredSlot = { slot: Slot; top: number; height: number };

function DragHandle(props: {
  onStart: () => void;
  onMove: (dy: number, y: number) => void;
  onDrop: (y: number) => void;
  onCancel: () => void;
  onTap: () => void;
}) {
  const latest = useRef(props);
  latest.current = props;
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => latest.current.onStart(),
        onPanResponderMove: (_, gesture) => latest.current.onMove(gesture.dy, gesture.moveY),
        onPanResponderRelease: (event, gesture) => {
          if (Math.abs(gesture.dy) < 4 && Math.abs(gesture.dx) < 4) {
            latest.current.onCancel();
            latest.current.onTap();
          } else latest.current.onDrop(gesture.moveY || event.nativeEvent.pageY);
        },
        onPanResponderTerminate: () => latest.current.onCancel(),
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );
  return (
    <View
      {...responder.panHandlers}
      style={styles.handle}
      accessible
      accessibilityRole="button"
      accessibilityLabel="끌어서 날짜와 순서 변경, 누르면 이동 메뉴"
      onAccessibilityTap={props.onTap}
    >
      <Ionicons name="reorder-three-outline" size={25} color="#77766F" />
    </View>
  );
}

export function SelectionReviewScreen() {
  const navigation = useNavigation<Nav>();
  const { plan, setSelectedPlaceDays, setSelectedPlaceIds } = usePlanning();
  const dayCount = getPlanningDays(plan.dateRange, plan.noSpecificDate);
  const days = useMemo(
    () => reconcilePlaceDays(plan.selectedPlaceIds, dayCount, plan.selectedPlaceDays),
    [plan.selectedPlaceIds, dayCount, plan.selectedPlaceDays],
  );
  const allPlaces = [
    ...(plan.placeRecommendations?.core ?? []),
    ...(plan.placeRecommendations?.suggestions ?? []),
  ];
  const [drag, setDrag] = useState<{ id: string; dy: number } | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [message, setMessage] = useState('오른쪽 손잡이를 끌어 순서나 날짜를 바꿔보세요.');
  const measuredSlots = useRef<MeasuredSlot[]>([]);
  const dragStartScroll = useRef(0);
  const rowLayouts = useRef(new Map<string, { top: number; height: number }>());
  const activeDragId = useRef<string | null>(null);
  const slots = useRef(new Map<string, Slot>());
  const scroll = useRef<ScrollView>(null);
  const viewportView = useRef<View>(null);
  const scrollOffset = useRef(0);
  const viewport = useRef({ top: 0, bottom: 0 });
  const lastScroll = useRef(0);
  const valid =
    plan.selectedPlaceIds.length > 0 && days.every((list) => list.length <= MAX_PLACES_PER_DAY);
  const register =
    (key: string, day: number, index: number, id?: string) => (view: View | null) => {
      if (view) slots.current.set(key, { view, day, index, id });
      else slots.current.delete(key);
    };
  const move = (id: string, day: number, index: number) => {
    const sourceDay = days.findIndex((ids) => ids.includes(id));
    const next = moveScheduledPlace(days, id, day, index);
    if (next === days) {
      setMessage('이 날짜에는 최대 5곳까지 담을 수 있어요.');
      return;
    }
    if (JSON.stringify(next) === JSON.stringify(days)) return;
    setSelectedPlaceDays(next);
    const name = getPlaceDisplayTitle(
      allPlaces.find((place) => place.contentId === id)?.title ?? '장소',
      plan.selectedRegion?.name,
    );
    setMessage(
      sourceDay === day
        ? `${name}의 방문 순서를 바꿨어요.`
        : `${name}를 DAY ${day + 1}로 옮겼어요.`,
    );
  };
  const startDrag = async (id: string) => {
    activeDragId.current = id;
    measuredSlots.current = [];
    dragStartScroll.current = scrollOffset.current;
    setTarget(null);
    setDrag({ id, dy: 0 });
    const measured = await Promise.all(
      [...slots.current.values()]
        .filter((slot) => slot.id !== id)
        .map(
          (slot) =>
            new Promise<{ slot: Slot; top: number; height: number }>((resolve) =>
              slot.view.measureInWindow((_, top, __, height) => resolve({ slot, top, height })),
            ),
        ),
    );
    if (activeDragId.current === id) measuredSlots.current = measured;
  };
  const findTarget = (y: number): Target | null => {
    if (y < viewport.current.top || y > viewport.current.bottom) return null;
    const adjustedY = y + scrollOffset.current - dragStartScroll.current;
    const measured = measuredSlots.current;
    const target = measured.reduce<(typeof measured)[number] | null>((best, item) => {
      const distance =
        adjustedY < item.top
          ? item.top - adjustedY
          : adjustedY > item.top + item.height
            ? adjustedY - item.top - item.height
            : 0;
      const bestDistance = !best
        ? Infinity
        : adjustedY < best.top
          ? best.top - adjustedY
          : adjustedY > best.top + best.height
            ? adjustedY - best.top - best.height
            : 0;
      return distance < bestDistance ? item : best;
    }, null);
    if (!target) return null;
    return {
      day: target.slot.day,
      index:
        target.slot.index + (target.slot.id && adjustedY > target.top + target.height / 2 ? 1 : 0),
    };
  };
  const cancelDrag = () => {
    activeDragId.current = null;
    setTarget(null);
    setDrag(null);
  };
  const drop = (id: string, y: number) => {
    const destination = findTarget(y);
    if (destination) move(id, destination.day, destination.index);
    cancelDrag();
  };
  const moveDrag = (id: string, dy: number, y: number) => {
    setDrag({ id, dy: dy + scrollOffset.current - dragStartScroll.current });
    setTarget(findTarget(y));
    if (Date.now() - lastScroll.current < 40) return;
    const direction = y < viewport.current.top + 45 ? -1 : y > viewport.current.bottom - 45 ? 1 : 0;
    if (direction) {
      lastScroll.current = Date.now();
      scroll.current?.scrollTo({
        y: Math.max(0, scrollOffset.current + direction * 18),
        animated: false,
      });
    }
  };
  const sourceDay = drag ? days.findIndex((ids) => ids.includes(drag.id)) : -1;
  const sourceIndex = drag && sourceDay >= 0 ? days[sourceDay].indexOf(drag.id) : -1;
  const dragHeight = drag ? (rowLayouts.current.get(drag.id)?.height ?? 67) + 10 : 77;
  const allowedTarget =
    target && drag && (sourceDay === target.day || days[target.day].length < MAX_PLACES_PER_DAY)
      ? target
      : null;
  const sectionShift = (day: number) =>
    allowedTarget && sourceDay !== allowedTarget.day
      ? (allowedTarget.day < day ? dragHeight : 0) - (sourceDay < day ? dragHeight : 0)
      : 0;
  const rowShift = (day: number, index: number) => {
    if (!allowedTarget) return 0;
    if (sourceDay === allowedTarget.day) {
      if (day !== sourceDay) return 0;
      if (sourceIndex < allowedTarget.index && index > sourceIndex && index < allowedTarget.index)
        return -dragHeight;
      if (sourceIndex >= allowedTarget.index && index >= allowedTarget.index && index < sourceIndex)
        return dragHeight;
      return 0;
    }
    return (
      (day === sourceDay && index > sourceIndex ? -dragHeight : 0) +
      (day === allowedTarget.day && index >= allowedTarget.index ? dragHeight : 0)
    );
  };
  const gapTop = (day: number) => {
    if (!allowedTarget || allowedTarget.day !== day) return 0;
    const ids = days[day];
    const row = rowLayouts.current.get(ids[allowedTarget.index]);
    const last = rowLayouts.current.get(ids[ids.length - 1]);
    const top = row?.top ?? (last ? last.top + last.height + 10 : 34);
    return top - (sourceDay === day && sourceIndex < allowedTarget.index ? dragHeight : 0);
  };
  return (
    <SafeAreaView
      style={[styles.safe, Platform.OS === 'web' && styles.webSafe]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="뒤로 가기">
          <Ionicons name="chevron-back" size={25} color="#252725" />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          hitSlop={12}
          accessibilityLabel="홈으로 가기"
        >
          <Ionicons name="home-outline" size={25} color="#252725" />
        </Pressable>
      </View>
      <View
        ref={viewportView}
        style={styles.scroll}
        onLayout={() =>
          viewportView.current?.measureInWindow((_, top, __, height) => {
            viewport.current = { top, bottom: top + height };
          })
        }
      >
        <ScrollView
          ref={scroll}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          scrollEnabled={!drag}
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            scrollOffset.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          <Text style={styles.heading}>고른 장소를 날짜별로{'\n'}나눠주세요</Text>
          <Text style={styles.subtitle}>DAY별 최대 5곳까지 담을 수 있어요.</Text>
          <View style={styles.tripBadge}>
            <Text style={styles.tripText}>
              {dayCount === 1 ? '당일' : `${dayCount - 1}박 ${dayCount}일`} ·{' '}
              {plan.selectedPlaceIds.length}곳
            </Text>
          </View>
          {days.map((ids, day) => (
            <View
              key={day}
              style={[
                styles.daySection,
                {
                  transform: [{ translateY: sectionShift(day) }],
                  zIndex: sourceDay === day ? 10 : 0,
                },
              ]}
            >
              <View
                ref={register(`day-${day}`, day, 0)}
                collapsable={false}
                style={styles.dayHeader}
              >
                <Text style={styles.dayTitle}>DAY {day + 1}</Text>
                <Text style={styles.dayCount}>{ids.length} / 5</Text>
              </View>
              {!ids.length && (
                <View
                  ref={register(`empty-${day}`, day, 0)}
                  collapsable={false}
                  style={styles.emptyDay}
                >
                  <Text style={styles.emptyText}>이 날짜로 장소를 끌어오세요.</Text>
                </View>
              )}
              {ids.map((id, index) => {
                const place = allPlaces.find((item) => item.contentId === id);
                if (!place) return null;
                return (
                  <View
                    key={id}
                    ref={register(id, day, index, id)}
                    collapsable={false}
                    onLayout={(event) =>
                      rowLayouts.current.set(id, {
                        top: event.nativeEvent.layout.y,
                        height: event.nativeEvent.layout.height,
                      })
                    }
                    style={[
                      styles.placeCard,
                      { transform: [{ translateY: rowShift(day, index) }] },
                      drag?.id === id && {
                        transform: [{ translateY: drag.dy - sectionShift(day) }],
                        zIndex: 10,
                        shadowColor: '#24443A',
                        shadowOpacity: 0.2,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 8,
                        borderColor: '#24443A',
                      },
                    ]}
                  >
                    <Pressable
                      style={styles.placeContent}
                      onPress={() => navigation.navigate('PlaceDetail', { contentId: id })}
                    >
                      <View style={styles.imageWrap}>
                        {place.imageUrl ? (
                          <Image source={{ uri: place.imageUrl }} style={styles.image} />
                        ) : (
                          <Ionicons
                            name={place.purpose.includes('카페') ? 'cafe-outline' : 'image-outline'}
                            size={23}
                            color="#24443A"
                          />
                        )}
                      </View>
                      <View style={styles.placeText}>
                        <Text style={styles.placeName}>
                          {getPlaceDisplayTitle(place.title, plan.selectedRegion?.name)}
                        </Text>
                        <Text style={styles.purpose}>{place.purpose}</Text>
                      </View>
                    </Pressable>
                    <DragHandle
                      onStart={() => {
                        void startDrag(id);
                      }}
                      onMove={(dy, y) => moveDrag(id, dy, y)}
                      onDrop={(y) => {
                        drop(id, y);
                      }}
                      onCancel={cancelDrag}
                      onTap={() => setMenuId(id)}
                    />
                  </View>
                );
              })}
              {allowedTarget?.day === day && (
                <View
                  pointerEvents="none"
                  style={[styles.dropGap, { top: gapTop(day), height: dragHeight - 10 }]}
                >
                  <Text style={styles.dropGapText}>여기에 놓기 · DAY {day + 1}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <Text style={styles.hint} accessibilityLiveRegion="polite">
          {drag
            ? target && !allowedTarget
              ? '이 날짜에는 이미 5곳이 있어요. 다른 날짜에 놓아주세요.'
              : '초록색 빈칸에 놓으면 방문 순서가 바뀌어요.'
            : message}
        </Text>
        <Pressable
          disabled={!valid}
          style={[styles.confirm, !valid && styles.disabled]}
          onPress={() => {
            setSelectedPlaceDays(days);
            navigation.navigate('CoursePreview');
          }}
        >
          <Text style={styles.confirmText}>이대로 일정 만들기</Text>
          <Ionicons name="chevron-forward" size={19} color="#FFFFFF" />
        </Pressable>
        <Pressable
          style={styles.browseButton}
          accessibilityRole="button"
          onPress={() => {
            setSelectedPlaceDays(days);
            navigation.navigate('PlaceSelection');
          }}
        >
          <Text style={styles.browseText}>장소 더 둘러보기</Text>
        </Pressable>
      </View>
      <Modal
        visible={Boolean(menuId)}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuId(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>날짜와 순서 바꾸기</Text>
            {menuId &&
              days.map((ids, day) => (
                <Pressable
                  key={day}
                  style={styles.menuButton}
                  disabled={!ids.includes(menuId) && ids.length >= 5}
                  onPress={() => {
                    move(menuId, day, ids.length);
                    setMenuId(null);
                  }}
                >
                  <Text style={styles.menuText}>
                    DAY {day + 1}로 이동 · {ids.length}/5
                  </Text>
                </Pressable>
              ))}
            {menuId && (
              <View style={styles.menuRow}>
                {[-1, 1].map((direction) => (
                  <Pressable
                    key={direction}
                    style={styles.menuButton}
                    onPress={() => {
                      const day = days.findIndex((ids) => ids.includes(menuId));
                      const index = days[day]?.indexOf(menuId) ?? -1;
                      if (index + direction >= 0 && index + direction < days[day].length)
                        move(menuId, day, index + (direction > 0 ? 2 : -1));
                      setMenuId(null);
                    }}
                  >
                    <Text style={styles.menuText}>
                      {direction < 0 ? '위로 이동' : '아래로 이동'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            <Pressable
              style={styles.menuButton}
              onPress={() => {
                setSelectedPlaceIds(plan.selectedPlaceIds.filter((id) => id !== menuId));
                setMenuId(null);
              }}
            >
              <Text style={styles.removeText}>일정에서 빼기</Text>
            </Pressable>
            <Pressable style={styles.menuButton} onPress={() => setMenuId(null)}>
              <Text style={styles.menuText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  dropGap: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#24443A',
    backgroundColor: '#EAF2ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropGapText: { fontSize: 11, color: '#24443A', fontWeight: '600' },
  safe: { flex: 1, backgroundColor: '#FCFAF7' },
  webSafe: { marginTop: -56, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 15,
    paddingBottom: 22,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 28, paddingTop: 9, paddingBottom: 25 },
  heading: { fontSize: 23, lineHeight: 30, fontWeight: '700', color: '#252725' },
  subtitle: { marginTop: 6, fontSize: 12, color: '#77766F' },
  tripBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 18,
    paddingHorizontal: 17,
    paddingVertical: 6,
    marginTop: 17,
    marginBottom: 17,
  },
  tripText: { fontSize: 11, color: '#77766F' },
  daySection: { marginBottom: 5 },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 7,
    backgroundColor: '#EFEEE7',
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginBottom: 6,
  },
  dayTitle: { fontSize: 11, fontWeight: '700', color: '#24443A' },
  dayCount: { fontSize: 11, color: '#77766F' },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 67,
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    padding: 9,
  },
  placeContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  imageWrap: {
    width: 49,
    height: 49,
    borderRadius: 9,
    backgroundColor: '#E9EEE8',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  placeText: { flex: 1 },
  placeName: { fontSize: 13, fontWeight: '700', lineHeight: 19, color: '#252725' },
  purpose: { fontSize: 11, color: '#77766F', marginTop: 3 },
  handle: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center' },
  emptyDay: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D9DED6',
    borderRadius: 12,
    padding: 19,
    marginBottom: 10,
  },
  emptyText: { fontSize: 11, color: '#77766F' },
  footer: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 24 },
  hint: {
    borderRadius: 8,
    backgroundColor: '#EFEEE7',
    padding: 11,
    fontSize: 10,
    lineHeight: 16,
    color: '#77766F',
    marginBottom: 13,
  },
  confirm: {
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: '#24443A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 23,
  },
  confirmText: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  browseButton: { alignItems: 'center', paddingTop: 14, paddingBottom: 6 },
  browseText: { fontSize: 12, fontWeight: '600', color: '#24443A' },
  disabled: { opacity: 0.45 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '85%',
    borderRadius: 18,
    backgroundColor: '#FCFAF7',
    padding: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#252725', marginBottom: 13 },
  menuButton: { paddingVertical: 12, paddingHorizontal: 8 },
  menuText: { fontSize: 13, color: '#24443A' },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between' },
  removeText: { fontSize: 13, color: '#CD593C' },
});
