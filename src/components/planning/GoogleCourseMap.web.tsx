import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { CourseMapPlace } from './GoogleCourseMap';
import type { RoutePoint } from '../../api/routes';

type Props = {
  places: CourseMapPlace[];
  routePaths?: RoutePoint[][];
  connectionPaths?: RoutePoint[][];
  focus?: { points: RoutePoint[]; key: number } | null;
};

type MapInstance = {
  fitBounds: (bounds: unknown, padding?: number) => void;
  setCenter: (position: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
};

type MapOverlay = { setMap: (map: MapInstance | null) => void };

type GoogleMapsApi = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => MapInstance;
  Marker: new (options: Record<string, unknown>) => MapOverlay;
  Polyline: new (options: Record<string, unknown>) => MapOverlay;
  Size: new (width: number, height: number) => unknown;
  Point: new (x: number, y: number) => unknown;
  LatLngBounds: new () => { extend: (point: { lat: number; lng: number }) => void };
};

declare global {
  interface Window {
    google?: { maps: GoogleMapsApi };
    __optripGoogleMapsPromise?: Promise<GoogleMapsApi>;
  }
}

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (window.__optripGoogleMapsPromise) return window.__optripGoogleMapsPromise;

  window.__optripGoogleMapsPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src =
      'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(apiKey) + '&v=weekly';
    script.async = true;
    script.onload = () => {
      if (window.google?.maps) resolve(window.google.maps);
      else reject(new Error('Google Maps를 불러오지 못했습니다.'));
    };
    script.onerror = () => reject(new Error('Google Maps 연결에 실패했습니다.'));
    document.head.appendChild(script);
  });

  return window.__optripGoogleMapsPromise;
}

export function GoogleCourseMap({ places, routePaths = [], connectionPaths = [], focus }: Props) {
  const containerRef = useRef<View>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const overlaysRef = useRef<MapOverlay[]>([]);
  const [mapsApi, setMapsApi] = useState<GoogleMapsApi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !containerRef.current) return;

    let active = true;
    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (!active || !containerRef.current) return;

        if (!mapRef.current) {
          const element = containerRef.current as unknown as HTMLElement;
          mapRef.current = new maps.Map(element, {
            center: { lat: 35.8562, lng: 129.2247 },
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: false,
            cameraControl: false,
            styles: [
              { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
              {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [{ color: '#F3F2EE' }],
              },
              { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#E7EDDF' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#DCEAF1' }] },
            ],
          });
        }
        setMapsApi(maps);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : '지도를 표시하지 못했습니다.');
        }
      });

    return () => {
      active = false;
    };
  }, [apiKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapsApi || !map) return;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];
    if (places.length === 0) return;
    const overlays: MapOverlay[] = [];
    const bounds = new mapsApi.LatLngBounds();
    const path = places.map((place) => ({ lat: place.latitude, lng: place.longitude }));

    routePaths.forEach((routePath) => {
      if (routePath.length < 2) return;
      overlays.push(
        new mapsApi.Polyline({
          map,
          path: routePath,
          strokeColor: '#24443A',
          strokeOpacity: 0.85,
          strokeWeight: 3,
        }),
      );
    });
    connectionPaths.forEach((path) => {
      if (path.length < 2) return;
      overlays.push(
        new mapsApi.Polyline({
          map,
          path,
          strokeOpacity: 0,
          icons: [
            {
              icon: { path: 'M 0,-1 0,1', strokeColor: '#6F8A7D', strokeOpacity: 0.6, scale: 1.5 },
              offset: '0',
              repeat: '10px',
            },
          ],
        }),
      );
    });

    places.forEach((place, index) => {
      const position = { lat: place.latitude, lng: place.longitude };
      bounds.extend(position);
      overlays.push(
        new mapsApi.Marker({
          map,
          position,
          title: place.title,
          icon: {
            url:
              'data:image/svg+xml;charset=UTF-8,' +
              encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"><circle cx="15" cy="15" r="13" fill="#24443A" stroke="#FFFFFF" stroke-width="2"/></svg>',
              ),
            scaledSize: new mapsApi.Size(30, 30),
            anchor: new mapsApi.Point(15, 15),
            labelOrigin: new mapsApi.Point(15, 15),
          },
          label: { text: String(place.order ?? index + 1), color: '#FFFFFF', fontWeight: '700' },
          zIndex: places.length - index,
        }),
      );
    });

    if (path.length > 1) {
      map.fitBounds(bounds, 28);
    } else {
      map.setCenter(path[0]);
      map.setZoom(14);
    }

    overlaysRef.current = overlays;
  }, [mapsApi, places, routePaths, connectionPaths]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapsApi || !map || !focus?.points.length) return;
    if (focus.points.length === 1) {
      map.setCenter(focus.points[0]);
      map.setZoom(15);
      return;
    }
    const bounds = new mapsApi.LatLngBounds();
    focus.points.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, 54);
  }, [mapsApi, focus]);

  if (!apiKey) {
    return (
      <View style={styles.messageBox}>
        <Text style={styles.message}>Google Maps API 키를 확인해 주세요.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View ref={containerRef} style={styles.map} />
      {places.length === 0 && (
        <View style={styles.errorOverlay}>
          <Text style={styles.message}>이 날짜에는 선택한 장소가 없어요.</Text>
        </View>
      )}
      {error ? (
        <View style={styles.errorOverlay}>
          <Text style={styles.message}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { height: 220, overflow: 'hidden', borderRadius: 15, backgroundColor: '#ECE9E0' },
  map: { flex: 1 },
  messageBox: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#ECE9E0',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249,247,242,0.92)',
  },
  message: { paddingHorizontal: 20, textAlign: 'center', fontSize: 14, color: '#666666' },
});
