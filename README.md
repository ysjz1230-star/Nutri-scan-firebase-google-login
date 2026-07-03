# 🥗 NutriScan - AI 기반 스마트 식단관리

> 냉장고 사진 한 장으로 재료를 인식하고, 알레르기를 고려한 AI 레시피를 추천받는 스마트 식단관리 웹 앱

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel)](https://nutri-scan-firebase-google-login.vercel.app)

🔗 **라이브 데모**: [nutri-scan-firebase-google-login.vercel.app](https://nutri-scan-firebase-google-login.vercel.app)

---

## 📋 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [환경변수 설정](#-환경변수-설정)
- [프로젝트 구조](#-프로젝트-구조)
- [배포](#-배포)

---

## ✨ 주요 기능

### 🔐 Google 소셜 로그인 (Firebase Auth)
- Google 계정으로 1클릭 로그인
- **비로그인 게스트도 AI 핵심 기능 3회 무료 체험** 가능
- 무료 횟수 소진 후에도 앱 전체를 자유롭게 둘러보기 가능
- 상단 배너에 잔여 무료 횟수 실시간 표시

### 🛡️ 알레르기 관리
- 글루텐, 유제품, 달걀, 땅콩 등 12종 주요 알레르기 등록
- 심각도(경미 / 중간 / 심각 / 아나필락시스) 설정
- 레시피 추천 시 등록 알레르기 자동 필터링

### 🔥 칼로리 관리
- BMI · TDEE(Harris-Benedict 공식) 자동 계산
- 아침 / 점심 / 저녁 / 간식별 식사 기록
- 원형 달성률 차트, 주간 칼로리 트렌드 (Recharts)
- **AI 텍스트 검색**: 음식명 입력 시 칼로리·영양소 자동 입력
- **AI 사진 인식**: 음식 사진 업로드 시 음식명·칼로리·영양소 자동 인식
- AI가 채운 값 수정 후 기록 가능

### 📷 냉장고 AI 재료 인식
- 냉장고 사진 드래그&드롭 또는 클릭 업로드
- **Claude Vision AI**가 사진 속 식재료만 자동 인식 (포장재·용기 제외)
- 인식 결과에서 **재료명·수량·보관위치·유통기한 수정** 가능
- 불필요한 재료 개별 삭제 후 냉장고 목록에 추가

### 🧊 냉장고 재료 관리
- 재료별 **신선도 표시**: 색상 점 + D-Day 배지
  - 🟢 신선 (7일 이상) / 🟡 임박 (3~7일) / 🟠 주의 (1~3일) / 🔴 만료
- **유통기한 임박 배너**: 3일 이내 재료 상단 자동 경고
- **정렬 기능**: 등록순 / 가나다순 / 유통기한 임박순
- **인라인 수정**: 재료명·수량·유통기한·보관위치(냉장/냉동/팬트리) 직접 편집
- 위치별 필터링 (전체 / 냉장 / 냉동 / 팬트리)

### 🍳 AI 레시피 추천
- **재료 선택 화면** → 원하는 재료만 선택 후 레시피 추천
- 선택한 재료 기반 **Claude AI 실시간 레시피 생성** (3가지)
- 등록 알레르기 재료 자동 제외
- 조리 단계 상세 안내, 필요 추가 재료 표시
- "재료 변경" 버튼으로 재료 선택 화면으로 즉시 복귀

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| UI 프레임워크 | React 19 + TypeScript |
| 빌드 도구 | Vite 8 |
| 스타일링 | Tailwind CSS v4 |
| 상태관리 | Zustand (persist 미들웨어) |
| 서버 상태 | TanStack Query v5 |
| 라우팅 | React Router v7 |
| 인증 | Firebase Authentication (Google) |
| AI | Claude API — claude-haiku-4-5 (Vision · 텍스트 생성) |
| 차트 | Recharts (RadialBarChart · BarChart) |
| 파일 업로드 | 네이티브 Drag & Drop + File Input |
| 이미지 변환 | sharp (OG 이미지 SVG→PNG) |
| 배포 | Vercel |

---

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/ysjz1230-star/Nutri-scan-firebase-google-login.git
cd Nutri-scan-firebase-google-login
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env` 파일을 생성하고 아래 항목을 입력합니다.

```bash
# Claude AI (재료 인식 · 칼로리 검색 · 레시피 생성)
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

> **Firebase 설정값은 `src/lib/firebase.ts`에 직접 포함**되어 있습니다.
> 본인 Firebase 프로젝트로 교체하려면 해당 파일의 `firebaseConfig` 객체를 수정하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 🔑 환경변수 설정

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `VITE_ANTHROPIC_API_KEY` | Claude AI API 키 | ✅ 필수 |

### API 키 발급

| 서비스 | 발급 경로 | 비고 |
|--------|-----------|------|
| Anthropic (Claude) | [console.anthropic.com](https://console.anthropic.com) | 사용량 기반 과금 |
| Firebase | [console.firebase.google.com](https://console.firebase.google.com) | 무료 (Spark 플랜) |

### Firebase 추가 설정

1. Firebase Console → **Authentication** → Sign-in method → **Google 활성화**
2. Firebase Console → **Authentication** → Settings → **Authorized domains**
   - `nutri-scan-firebase-google-login.vercel.app` 추가 (Vercel 배포 도메인)

---

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── layout/Layout.tsx          # 헤더 네비게이션 + 게스트 배너
│   ├── LoginPromptModal.tsx       # 무료 횟수 소진 시 로그인 유도 모달
│   └── ProtectedRoute.tsx         # 라우트 가드 (로딩 처리)
├── lib/
│   └── firebase.ts                # Firebase 초기화 (설정값 포함)
├── pages/
│   ├── LoginPage.tsx              # Google 로그인 화면
│   ├── HomePage.tsx               # 대시보드 홈
│   ├── AllergyPage.tsx            # 알레르기 관리
│   ├── CaloriePage.tsx            # 칼로리 기록 + AI 검색/사진 인식
│   ├── FridgePage.tsx             # 냉장고 관리 + AI 재료 인식 + AI 레시피
│   └── ProfilePage.tsx            # 프로필 & BMI 계산
├── stores/
│   ├── useStore.ts                # 앱 전역 상태 (Zustand persist)
│   ├── useAuthStore.ts            # Firebase 인증 상태
│   └── useGuestStore.ts           # 게스트 무료 횟수 관리
├── types/index.ts                 # TypeScript 타입 정의
└── utils/
    ├── allergenMap.ts             # 알레르기 항목 매핑
    ├── calorieCalculator.ts       # BMI · TDEE 계산 공식
    ├── cn.ts                      # Tailwind 클래스 유틸
    └── imageCompressor.ts         # 업로드 이미지 압축

public/
├── favicon.svg                    # 앱 파비콘
├── og-image.svg                   # OG 이미지 원본
└── og-image.png                   # 링크 미리보기 이미지 (1200×630)

scripts/
└── generate-og.mjs                # OG 이미지 SVG→PNG 변환 스크립트
```

---

## 🚀 배포

### Vercel 자동 배포

1. [vercel.com](https://vercel.com)에서 이 GitHub 저장소 Import
2. **Settings → Environment Variables**에 `VITE_ANTHROPIC_API_KEY` 추가
3. 이후 `main` 브랜치에 push하면 자동 재배포

### OG 이미지 재생성 (선택)

링크 미리보기 이미지를 수정한 경우:

```bash
node scripts/generate-og.mjs
```

---

## 📱 주요 사용 흐름

```
앱 접속
├── 비로그인 게스트 → 앱 자유 둘러보기 (AI 기능 3회 무료)
│   └── 3회 소진 후 AI 기능 시도 → 로그인 유도 모달
└── Google 로그인 → 모든 기능 무제한 사용

냉장고 재료 등록
├── 사진 업로드 → AI 인식 → 결과 수정(이름/수량/위치/유통기한) → 추가
└── 직접 추가 → 이름/수량/위치/유통기한 입력

칼로리 기록
├── 직접 입력
├── AI 텍스트 검색 → 음식명 입력 → 영양소 자동 입력
└── AI 사진 인식 → 음식 사진 업로드 → 음식명+영양소 자동 입력

AI 레시피 추천
└── 레시피 버튼 → 재료 선택 → AI 레시피 3가지 생성
```

---

## ⚠️ 면책 조항

이 앱은 의료 조언을 제공하지 않습니다. 알레르기 정보 및 칼로리 계산은 참고용이며,
심각한 알레르기가 있는 사용자는 반드시 의사 또는 영양 전문가와 상담하세요.

---

*Built with ❤️ using React + Claude AI + Firebase*
