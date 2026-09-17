import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPlaceDisplayTitle, type PlaceSummary } from '../../api/places';

export function PlaceChoiceCard({
  place,
  regionName,
  selected,
  disabled,
  onToggle,
  onDetail,
}: {
  place: PlaceSummary;
  regionName?: string;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onDetail: () => void;
}) {
  return (
    <View style={[styles.card, selected && styles.selected]}>
      <Pressable
        style={styles.main}
        onPress={onToggle}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        accessibilityLabel={`${getPlaceDisplayTitle(place.title, regionName)} ${selected ? '선택 해제' : '선택'}`}
      >
        <View style={styles.imageWrap}>
          {place.imageUrl ? (
            <Image source={{ uri: place.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <Ionicons
              name={place.purpose.includes('카페') ? 'cafe-outline' : 'image-outline'}
              size={30}
              color="#24443A"
            />
          )}
        </View>
        <View style={styles.body}>
          <Text style={styles.purpose}>{place.purpose}</Text>
          <Text style={styles.title}>{getPlaceDisplayTitle(place.title, regionName)}</Text>
          <Text style={styles.reason} numberOfLines={2}>
            {place.reason}
          </Text>
        </View>
        <View style={[styles.check, selected && styles.checked, disabled && styles.disabled]}>
          <Ionicons
            name={selected ? 'checkmark' : 'add'}
            size={18}
            color={selected ? '#FFFFFF' : '#24443A'}
          />
        </View>
      </Pressable>
      <Pressable
        style={styles.detail}
        onPress={onDetail}
        accessibilityLabel={`${place.title} 자세히 보기`}
      >
        <Text style={styles.detailText}>자세히 보기</Text>
        <Ionicons name="chevron-forward" size={14} color="#24443A" />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  selected: { borderColor: '#24443A' },
  main: { flexDirection: 'row', padding: 9, gap: 12, alignItems: 'flex-start' },
  imageWrap: {
    width: 82,
    height: 88,
    backgroundColor: '#F0EDE5',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  body: { flex: 1, paddingTop: 5 },
  purpose: { fontSize: 10, color: '#CD593C' },
  title: { fontSize: 15, fontWeight: '700', lineHeight: 21, color: '#252725', marginTop: 3 },
  reason: { fontSize: 11, lineHeight: 16, color: '#77766F', marginTop: 3 },
  check: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#EFEEE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  checked: { backgroundColor: '#24443A' },
  disabled: { opacity: 0.4 },
  detail: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingBottom: 9,
    minHeight: 25,
  },
  detailText: { fontSize: 10, color: '#24443A', fontWeight: '600' },
});
