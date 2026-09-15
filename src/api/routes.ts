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
