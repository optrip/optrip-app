import AsyncStorage from '@react-native-async-storage/async-storage';

// 크로스플랫폼 영속 저장소.
// - 웹: localStorage 기반 (새로고침해도 유지)
// - 네이티브: 앱 내 저장소
// JSON 직렬화/역직렬화를 감싸 타입 안전하게 사용한다.
export async function loadJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 무시 (저장소 접근 불가 등)
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // 무시
  }
}
