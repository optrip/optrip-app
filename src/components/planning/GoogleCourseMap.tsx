import { StyleSheet, Text, View } from 'react-native';

import type { RoutePoint } from '../../api/routes';

export type CourseMapPlace = {
  contentId: string;
  title: string;
  latitude: number;
  longitude: number;
};

type Props = {
  places: CourseMapPlace[];
  routePaths?: RoutePoint[][];
};

export function GoogleCourseMap({ places }: Props) {
  return (
    <View style={styles.fallback}>
      <Text style={styles.title}>지도는 현재 웹에서 먼저 확인할 수 있어요.</Text>
      <Text style={styles.description}>선택한 장소 {places.length}개</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#ECE9E0',
  },
  title: { fontSize: 15, fontWeight: '600', color: '#555555' },
  description: { marginTop: 6, fontSize: 13, color: '#888888' },
});
