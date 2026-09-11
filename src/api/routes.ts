export type RouteTravelMode = 'TRANSIT' | 'DRIVE';

export type TransitStep = {
  vehicleType: string;
  lineName: string;
  stopCount: number;
};

export type RouteLeg = {
  travelMode: RouteTravelMode;
  durationSeconds: number;
  distanceMeters: number;
  encodedPolyline: string;
  transitSteps: TransitStep[];
};

type RouteLegRequest = {
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  travelMode: RouteTravelMode;
};

const BASE_URL = 'https://optrip-server.fly.dev';
const routeCache = new Map<string, Promise<RouteLeg>>();

function cacheKey(request: RouteLegRequest) {
  return [
    request.originLatitude,
    request.originLongitude,
    request.destinationLatitude,
    request.destinationLongitude,
    request.travelMode,
  ].join(':');
}

export function getRouteLeg(request: RouteLegRequest) {
  const key = cacheKey(request);
  const cached = routeCache.get(key);
  if (cached) return cached;

  const pending = fetch(BASE_URL + '/api/routes/leg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(
        request.travelMode === 'TRANSIT'
          ? '이 구간의 대중교통 경로를 찾지 못했어요.'
          : '이 구간의 자동차 경로를 찾지 못했어요.',
      );
    }
    return (await response.json()) as RouteLeg;
  });

  routeCache.set(key, pending);
  pending.catch(() => routeCache.delete(key));
  return pending;
}

export type RoutePoint = { lat: number; lng: number };

export function decodeGooglePolyline(encoded: string): RoutePoint[] {
  const points: RoutePoint[] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    const latitudeResult = decodeValue(encoded, index);
    index = latitudeResult.nextIndex;
    latitude += latitudeResult.value;

    const longitudeResult = decodeValue(encoded, index);
    index = longitudeResult.nextIndex;
    longitude += longitudeResult.value;

    points.push({ lat: latitude / 1e5, lng: longitude / 1e5 });
  }

  return points;
}

function decodeValue(encoded: string, startIndex: number) {
  let index = startIndex;
  let result = 0;
  let shift = 0;
  let byte: number;

  do {
    byte = encoded.charCodeAt(index) - 63;
    index += 1;
    result |= (byte & 0x1f) << shift;
    shift += 5;
  } while (byte >= 0x20 && index < encoded.length);

  return {
    value: result & 1 ? ~(result >> 1) : result >> 1,
    nextIndex: index,
  };
}
