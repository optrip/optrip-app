# OPTRIP 다음 작업 인수인계

이 문서는 현재 PC에서 작업한 내용을 노트북으로 옮긴 뒤, 다음 개발을 이어가기 위한 안내서입니다.

## 현재 작업 내용

현재 작업은 `main` 브랜치에서 진행되었지만 아직 commit하지 않은 상태입니다.

구현한 화면 흐름:

```text
홈
-> 해석 결과 확인
-> 잘못 이해했어요
-> 취향 다시 선택
-> 여행지 후보
-> 여행지 자세히 보기
-> 지역 선택하기
```

추가하거나 수정한 주요 파일:

- `src/screens/planning/InterpretationReviewScreen.tsx`
  - 해석 결과 확인 화면
- `src/screens/planning/PreferenceCorrectionScreen.tsx`
  - 취향 다시 선택 화면
- `src/screens/planning/RegionCandidatesScreen.tsx`
  - 여행지 후보 3개 화면
- `src/screens/planning/RegionDetailScreen.tsx`
  - 여행지 자세히 보기 및 지역 선택 화면
- `src/api/regions.ts`
  - 지역 응답 타입과 임시 mock 데이터
- `src/lib/planningStore.tsx`
  - 선택한 지역을 저장하는 상태 추가
- `src/navigation/types.ts`
  - 새 화면 이름과 이동 데이터 타입 추가
- `src/navigation/OnboardingNavigator.tsx`
  - 새 화면 등록
- `src/screens/HomeScreen.tsx`
  - 현재는 화면을 확인하기 위해 홈에서 해석 결과 화면으로 임시 진입
- `src/screens/planning/RegionCandidatesPlaceholderScreen.tsx`
  - 예전에 만든 임시 화면. 현재 실제 흐름에서는 사용하지 않음

## 중요한 현재 상태

`src/api/regions.ts`의 지역 데이터는 실제 API 데이터가 아니라 화면 확인용 mock 데이터입니다.

현재 mock 지역:

- 경주
- 동해
- 속초

나중에 실제 서버 API를 연결할 때는 화면 파일에 지역 데이터를 다시 작성하지 않고, API 함수만 실제 요청으로 교체합니다.

현재 서버 API와 연결된 것은 아닙니다.

## 오늘 PC에서 할 일

### 1. 프로젝트 폴더로 이동

PowerShell에서 아래 명령어를 입력합니다.

```powershell
cd C:\Users\blued\Projects\optrip-app
```

`cd`는 폴더를 이동하는 명령어입니다.

### 2. 현재 변경 확인

```powershell
git status
```

`git status`는 아직 commit하지 않은 파일을 보여줍니다.

### 3. 새 작업 브랜치 만들기

현재 `main`에서 작업했으므로, 먼저 안전한 작업 브랜치를 만듭니다.

```powershell
git switch -c feature/region-candidates
```

뜻:

- `feature/region-candidates`: 새 브랜치 이름
- `-c`: 새 브랜치를 만들고 그 브랜치로 이동

이 명령 이후부터는 `main`이 아니라 `feature/region-candidates`에서 작업합니다.

### 4. 실제 변경 내용 확인

```powershell
git diff
```

새로 만든 파일 내용까지 확인하려면:

```powershell
git status
```

변경 내용이 예상과 다르면 commit하지 말고 먼저 확인합니다.

### 5. 타입 검사

```powershell
npm run typecheck
```

`passed` 또는 오류 없이 명령어가 끝나는지 확인합니다.

### 6. 필요한 파일만 staging 하기

아래 명령어는 이번 작업 파일만 Git에 기록 대상으로 올립니다.

```powershell
git add NEXT_SESSION.md `
  src/api/regions.ts `
  src/lib/planningStore.tsx `
  src/navigation/OnboardingNavigator.tsx `
  src/navigation/types.ts `
  src/screens/HomeScreen.tsx `
  src/screens/planning/InterpretationReviewScreen.tsx `
  src/screens/planning/PreferenceCorrectionScreen.tsx `
  src/screens/planning/RegionCandidatesPlaceholderScreen.tsx `
  src/screens/planning/RegionCandidatesScreen.tsx `
  src/screens/planning/RegionDetailScreen.tsx
```

PowerShell에서 줄 끝의 백틱(`)은 명령어가 다음 줄에도 이어진다는 뜻입니다.
한 줄로 입력해도 됩니다.

### 7. staging 결과 확인

```powershell
git status
```

`Changes to be committed` 아래에 이번 파일들이 보이면 됩니다.

### 8. commit 만들기

```powershell
git commit -m "feat: add interpretation and region candidate flow"
```

commit은 현재 작업을 하나의 저장 지점으로 만드는 것입니다.

### 9. commit 확인

```powershell
git log -1 --oneline
```

방금 입력한 commit 메시지가 보이면 성공입니다.

### 10. GitHub의 작업 브랜치에 올리기

```powershell
git push -u origin feature/region-candidates
```

이 명령어는 `main`이 아니라 `feature/region-candidates` 브랜치에 올립니다.

로그인 창이나 GitHub 인증이 나오면 본인의 GitHub 계정으로 진행합니다.

## 내일 노트북에서 할 일

### 방법 A: 이미 프로젝트가 노트북에 있는 경우

PowerShell에서 프로젝트 폴더로 이동합니다.

```powershell
cd 프로젝트가있는폴더\optrip-app
```

예:

```powershell
cd C:\Users\내이름\Projects\optrip-app
```

GitHub에서 최신 브랜치 정보를 가져옵니다.

```powershell
git fetch origin
```

`fetch`는 GitHub의 최신 branch 정보를 노트북으로 가져오지만, 아직 현재 파일에 합치지는 않습니다.

작업 브랜치로 이동합니다.

```powershell
git switch feature/region-candidates
```

만약 노트북에 branch가 아직 없다고 나오면 아래 명령어를 사용합니다.

```powershell
git switch -c feature/region-candidates --track origin/feature/region-candidates
```

최신 상태인지 확인합니다.

```powershell
git pull
```

의존성을 설치합니다.

```powershell
npm install
```

`node_modules`는 PC에서 복사하지 않고 노트북에서 새로 설치합니다.

타입 검사를 실행합니다.

```powershell
npm run typecheck
```

웹 화면을 실행합니다.

```powershell
npm run web
```

터미널에 표시되는 주소를 브라우저에서 엽니다. 포트가 이미 사용 중이면 Expo가 다른 포트를 물어볼 수 있습니다. 그때 `Y`를 입력하면 됩니다.

### 방법 B: 노트북에 프로젝트가 전혀 없는 경우

노트북에 Node.js와 Git을 먼저 설치해야 합니다.

설치 후 아래 명령어를 실행합니다.

```powershell
cd C:\Users\내이름\Projects
git clone https://github.com/optrip/optrip-app.git
cd optrip-app
git switch -c feature/region-candidates --track origin/feature/region-candidates
npm install
npm run typecheck
npm run web
```

`git clone`은 GitHub에 있는 프로젝트를 노트북으로 처음 복사하는 명령어입니다.

## 계속 작업한 뒤 다시 저장하는 방법

노트북에서 파일을 수정한 뒤 아래 순서로 실행합니다.

```powershell
git status
git diff
npm run typecheck
git add 수정한파일경로
git commit -m "feat: describe the change"
git push
```

예:

```powershell
git add src/screens/planning/RegionCandidatesScreen.tsx
git commit -m "style: adjust region candidate cards"
git push
```

## GitHub에서 주의할 점

- `main` 브랜치에 직접 push하지 않습니다.
- 항상 `feature/region-candidates` 같은 작업 branch에서 작업합니다.
- 작업 전 `git status`로 다른 변경사항이 있는지 확인합니다.
- `git diff`로 내가 올리려는 변경을 확인합니다.
- 다른 팀원의 파일을 `git checkout`으로 덮어쓰지 않습니다.
- `node_modules`는 GitHub에 올리지 않습니다.
- API 키, 비밀번호, 개인 토큰은 commit하지 않습니다.
- commit할 때는 관련된 파일만 `git add`합니다.
- 여러 기능을 한 번에 섞지 않고 작은 commit으로 나눕니다.

## 아직 GitHub에 올리고 싶지 않은 경우

오늘은 commit까지만 하고 push하지 않아도 됩니다.

```powershell
git switch -c feature/region-candidates
git add ...
git commit -m "feat: add interpretation and region candidate flow"
```

다만 이 경우 commit은 현재 PC에만 있으므로, 노트북에서 이어서 작업하려면 USB나 압축 파일로 프로젝트를 옮겨야 합니다.

노트북에서 이어서 작업할 목적이라면, `main`에 직접 올리지 않고 feature branch에 push하는 방법이 가장 편합니다.

## 다음 개발 예정

1. 실제 `POST /api/recommend/regions` 요청 연결
2. mock 데이터를 실제 서버 응답으로 교체
3. 선택 지역을 장소 추천 API에 전달
4. 선택 지역의 장소 추천 화면 구현
5. 사용자가 직접 장소를 담는 기능 구현

현재 사용자가 담은 장소를 AI가 임의로 추가하거나 삭제하는 로직은 만들지 않습니다.
