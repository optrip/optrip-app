# optrip-app

Expo + React Native 기반 모바일 앱.

## 스택

- **Expo SDK 54** (React Native 0.81, React 19, TypeScript)
- **@tanstack/react-query** — 서버 상태 관리
- **react-native-web** — 웹 빌드 지원
- **ESLint + Prettier** — 코드 품질

## 시작하기

### 사전 요구사항

- Node.js 20+
- iOS/Android 실기기로 테스트하려면 폰에 [Expo Go](https://expo.dev/client) 설치
- (선택) iOS 시뮬레이터: Xcode / Android 에뮬레이터: Android Studio

### 설치

```bash
npm install
```

## 실행

| 명령              | 용도                                                                          |
| ----------------- | ----------------------------------------------------------------------------- |
| `npm start`       | Metro 번들러 시작 → 터미널에 QR 코드. Expo Go 앱으로 스캔하면 실기기에서 실행 |
| `npm run ios`     | iOS 시뮬레이터 실행 (Xcode 필요)                                              |
| `npm run android` | Android 에뮬레이터 실행 (Android Studio 필요)                                 |
| `npm run web`     | 브라우저에서 실행 (`http://localhost:8081`)                                   |

> 가장 빠른 테스트는 **본인 폰에 Expo Go 깔고 `npm start` 후 QR 찍기**.

### 캐시 문제 발생 시

```bash
npx expo start -c
```

## 코드 품질

```bash
npm run lint          # ESLint 검사
npm run lint:fix      # ESLint 자동 수정
npm run format        # Prettier 자동 정렬
npm run format:check  # Prettier 검사만
npm run typecheck     # TypeScript 타입 검사
```

## 디렉토리 구조

```
optrip-app/
├── App.tsx                    # 앱 진입점 (QueryClientProvider 적용됨)
├── index.ts                   # registerRootComponent
├── app.json                   # Expo 설정
├── assets/                    # 아이콘, 스플래시 이미지 등
├── src/
│   ├── api/                   # API 호출 함수
│   ├── components/            # 재사용 컴포넌트
│   ├── hooks/                 # 커스텀 훅
│   ├── lib/                   # 유틸/공통 인스턴스 (queryClient 등)
│   ├── screens/               # 화면 컴포넌트
│   └── types/                 # 공용 타입
└── .github/workflows/deploy.yml  # GitHub Pages 자동 배포
```

## 웹 빌드 & 배포

### 로컬 정적 빌드

```bash
npm run build:web
```

→ `dist/` 폴더에 `index.html` + JS 번들 생성. 정적 호스팅에 그대로 업로드 가능.

```bash
npx serve dist  # 로컬에서 결과 확인
```

### GitHub Pages 자동 배포

`main` 브랜치에 push하면 GitHub Actions가 빌드 후 자동 배포합니다.

- 워크플로우: `.github/workflows/deploy.yml`
- 배포 URL: **https://optrip.github.io/optrip-app/**

> **최초 1회 수동 설정 필요**:
> repo Settings → Pages → **Source**를 `GitHub Actions`로 변경

빌드 진행 상황은 [Actions 탭](https://github.com/optrip/optrip-app/actions)에서 확인.

## 라이브러리 추가 시

Expo SDK 호환 버전을 자동으로 맞춰주는 명령을 사용하세요:

```bash
npx expo install <package-name>
```

`npm install`을 직접 쓰면 SDK와 버전이 안 맞아서 깨질 수 있음.

## 자주 쓰는 패턴

### React Query 사용 예시

```tsx
import { useQuery } from '@tanstack/react-query';

function Example() {
  const { data, isLoading } = useQuery({
    queryKey: ['hello'],
    queryFn: async () => fetch('/api/hello').then((r) => r.json()),
  });
  // ...
}
```

QueryClient는 `src/lib/queryClient.ts`에 정의되어 있으며, `App.tsx`에서 Provider로 적용됨.

## 트러블슈팅

| 증상                                         | 해결                                                    |
| -------------------------------------------- | ------------------------------------------------------- |
| 변경이 반영 안 됨                            | `npx expo start -c` (캐시 클리어)                       |
| 웹 빌드 후 자산이 404                        | `app.json`의 `experiments.baseUrl` 확인 (`/optrip-app`) |
| 네이티브 모듈 추가 후 Expo Go에서 실행 안 됨 | EAS Dev Client 빌드 필요 (네이티브 코드 변경됨)         |
| iOS/Android에서만 발생하는 이슈              | `Platform.OS`로 분기 확인                               |
