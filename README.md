# 🥗 NutriScan - AI 기반 스마트 식단관리

> 냉장고 사진 한 장으로 재료를 인식하고, 알레르기를 고려한 AI 레시피를 추천받는 스마트 식단관리 웹 앱

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

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
- **비로그인 게스트도 AI 핵심 기능 3회 무료 체험** 후 가입 유도

### 🛡️ 알레르기 관리
- 글루텐, 유제품, 달걀, 땅콩 등 12종 주요 알레르기 등록
- 심각도(경미 / 중간 / 심각 / 아나필락시스) 설정
- 레시피 추천 시 등록 알레르기 자동 필터링

### 🔥 칼로리 관리
- BMI · TDEE(Harris-Benedict 공식) 자동 계산
- 아침 / 점심 / 저녁 / 간식별 식사 기록
- 원형 달성률 차트, 주간 칼로리 트렌드 (Recharts)

### 📷 냉장고 AI 재료 인식
- 냉장고 사진 드래그&드롭 또는 클릭 업로드
- **Claude Vision AI**가 사진 속 재료를 자동 인식
- 인식 결과 확인 후 냉장고 목록에 한 번에 추가

### 🍳 AI 레시피 추천
- 보유 재료 기반 **Claude AI 실시간 레시피 생성**
- 등록 알레르기 재료 자동 제외
- 조리 단계 상세 안내, 필요 추가 재료 표시

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
| AI | Claude API (Vision · 텍스트 생성) |
| 차트 | Recharts |
| 파일 업로드 | 네이티브 Drag & Drop + File Input |
| 배포 | Vercel (Serverless Functions) |

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

```bash
cp .env.example .env
```

`.env` 파일에 API 키를 입력합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 🔑 환경변수 설정

`.env` 파일에 아래 항목을 입력하세요.

```bash
# Claude AI (재료 인식 · 레시피 생성)
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Firebase (Google 로그인)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:...
VITE_FIREBASE_MEASUREMENT_ID=G-...

# Spoonacular (레시피 DB - 선택)
SPOONACULAR_API_KEY=your_key_here

# NeonDB (데이터 영구 저장 - 선택)
DATABASE_URL=postgresql://...
```

### API 키 발급 방법

| 서비스 | 발급 경로 | 무료 한도 |
|--------|-----------|-----------|
| Anthropic (Claude) | [console.anthropic.com](https://console.anthropic.com) | 사용량 기반 과금 |
| Firebase | [console.firebase.google.com](https://console.firebase.google.com) | 무료 (Spark 플랜) |
| Spoonacular | [spoonacular.com/food-api](https://spoonacular.com/food-api) | 150 req/day |

> **Firebase 추가 설정**: Firebase Console → Authentication → Sign-in method → **Google 활성화**

---

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── layout/Layout.tsx          # 헤더 네비게이션 + 게스트 배너
│   ├── LoginPromptModal.tsx       # 무료 횟수 소진 시 로그인 유도 모달
│   └── ProtectedRoute.tsx         # 인증 / 게스트 라우트 가드
├── lib/
│   └── firebase.ts                # Firebase 초기화
├── pages/
│   ├── LoginPage.tsx              # Google 로그인 화면
│   ├── HomePage.tsx               # 대시보드 홈
│   ├── AllergyPage.tsx            # 알레르기 관리
│   ├── CaloriePage.tsx            # 칼로리 기록 & 차트
│   ├── FridgePage.tsx             # 냉장고 관리 + AI 레시피
│   └── ProfilePage.tsx            # 프로필 & BMI 계산
├── stores/
│   ├── useStore.ts                # 앱 전역 상태 (Zustand)
│   ├── useAuthStore.ts            # Firebase 인증 상태
│   └── useGuestStore.ts           # 게스트 무료 횟수 관리
├── types/index.ts                 # TypeScript 타입 정의
└── utils/
    ├── allergenMap.ts             # 알레르기 항목 매핑
    ├── calorieCalculator.ts       # BMI · TDEE 계산 공식
    ├── cn.ts                      # Tailwind 클래스 유틸
    └── imageCompressor.ts         # 업로드 이미지 압축

api/                               # Vercel Serverless Functions
├── allergy.ts
├── calories.ts
├── profile.ts
├── recipes.ts
└── fridge/
    ├── index.ts
    └── scan.ts                    # Claude Vision API 연동
```

---

## 🚀 배포

Vercel Dashboard에서 이 GitHub 저장소를 Import하면 자동 배포됩니다.
Settings → Environment Variables에 `.env` 항목을 동일하게 등록하세요.

---

## ⚠️ 면책 조항

이 앱은 의료 조언을 제공하지 않습니다. 알레르기 정보 및 칼로리 계산은 참고용이며,
심각한 알레르기가 있는 사용자는 반드시 의사 또는 영양 전문가와 상담하세요.

---

*Built with ❤️ using React + Claude AI + Firebase*
