import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import type { RoutePoint } from '../../api/routes';

export type CourseMapPlace = {
  contentId: string;
  title: string;
  latitude: number;
  longitude: number;
  order?: number;
};

type Props = {
  places: CourseMapPlace[];
  routePaths?: RoutePoint[][];
  connectionPaths?: RoutePoint[][];
  focus?: { points: RoutePoint[]; key: number } | null;
};

// 웹(GoogleCourseMap.web.tsx)과 같은 지도를 WebView 안에서 그린다.
// 마커/경로선 모양과 줌 동작을 웹 구현과 맞춰 두 플랫폼이 같은 화면을 보여준다.
function mapHtml(apiKey: string) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>html,body,#map{height:100%;margin:0;padding:0;background:#ECE9E0}</style>
</head>
<body>
<div id="map"></div>
<script>
var map = null, maps = null, overlays = [], pendingData = null, pendingFocus = null;

function post(type, message) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, message: message }));
  }
}

function initMap() {
  maps = window.google.maps;
  map = new maps.Map(document.getElementById('map'), {
    center: { lat: 35.8562, lng: 129.2247 },
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: false,
    cameraControl: false,
    gestureHandling: 'greedy',
    styles: [
      { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
      { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#F3F2EE' }] },
      { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#E7EDDF' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#DCEAF1' }] }
    ]
  });
  if (pendingData) render(pendingData);
  if (pendingFocus) focusPoints(pendingFocus);
  post('ready');
}

function render(data) {
  if (!map) { pendingData = data; return; }
  pendingData = null;
  overlays.forEach(function (overlay) { overlay.setMap(null); });
  overlays = [];

  var places = data.places || [];
  if (!places.length) return;

  (data.routePaths || []).forEach(function (path) {
    if (path.length < 2) return;
    overlays.push(new maps.Polyline({
      map: map, path: path, strokeColor: '#24443A', strokeOpacity: 0.85, strokeWeight: 3
    }));
  });

  (data.connectionPaths || []).forEach(function (path) {
    if (path.length < 2) return;
    overlays.push(new maps.Polyline({
      map: map, path: path, strokeOpacity: 0,
      icons: [{
        icon: { path: 'M 0,-1 0,1', strokeColor: '#6F8A7D', strokeOpacity: 0.6, scale: 1.5 },
        offset: '0', repeat: '10px'
      }]
    }));
  });

  var bounds = new maps.LatLngBounds();
  places.forEach(function (place, index) {
    var position = { lat: place.latitude, lng: place.longitude };
    bounds.extend(position);
    overlays.push(new maps.Marker({
      map: map,
      position: position,
      title: place.title,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"><circle cx="15" cy="15" r="13" fill="#24443A" stroke="#FFFFFF" stroke-width="2"/></svg>'
        ),
        scaledSize: new maps.Size(30, 30),
        anchor: new maps.Point(15, 15),
        labelOrigin: new maps.Point(15, 15)
      },
      label: { text: String(place.order || index + 1), color: '#FFFFFF', fontWeight: '700' },
      zIndex: places.length - index
    }));
  });

  if (places.length > 1) {
    map.fitBounds(bounds, 28);
  } else {
    map.setCenter({ lat: places[0].latitude, lng: places[0].longitude });
    map.setZoom(14);
  }
}

function focusPoints(points) {
  if (!map) { pendingFocus = points; return; }
  pendingFocus = null;
  if (!points || !points.length) return;
  if (points.length === 1) {
    map.setCenter(points[0]);
    map.setZoom(15);
    return;
  }
  var bounds = new maps.LatLngBounds();
  points.forEach(function (point) { bounds.extend(point); });
  map.fitBounds(bounds, 54);
}

window.__render = render;
window.__focus = focusPoints;
window.gm_authFailure = function () { post('error', '지도를 표시하지 못했습니다.'); };
</script>
<script async src="https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&callback=initMap"></script>
</body>
</html>`;
}

export function GoogleCourseMap({ places, routePaths = [], connectionPaths = [], focus }: Props) {
  const webRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const html = useMemo(() => (apiKey ? mapHtml(apiKey) : ''), [apiKey]);
  const payload = useMemo(
    () => JSON.stringify({ places, routePaths, connectionPaths }),
    [places, routePaths, connectionPaths],
  );

  useEffect(() => {
    if (!ready) return;
    webRef.current?.injectJavaScript(`window.__render(${payload});true;`);
  }, [ready, payload]);

  useEffect(() => {
    if (!ready || !focus?.points.length) return;
    webRef.current?.injectJavaScript(`window.__focus(${JSON.stringify(focus.points)});true;`);
  }, [ready, focus]);

  if (!apiKey) {
    return (
      <View style={styles.messageBox}>
        <Text style={styles.message}>Google Maps API 키를 확인해 주세요.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <WebView
        ref={webRef}
        style={styles.map}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://optrip.github.io' }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        nestedScrollEnabled
        androidLayerType="hardware"
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'ready') setReady(true);
            if (data.type === 'error') setError(data.message);
          } catch {
            // 무시
          }
        }}
        onError={() => setError('지도를 불러오지 못했습니다.')}
      />
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
  map: { flex: 1, backgroundColor: '#ECE9E0' },
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
