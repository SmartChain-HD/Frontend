# 🏗️ SmartChain 프로젝트 구조

> 현대중공업 협력사 통합관리시스템 - Tailwind CSS v4 & React & Vite

## 📁 프로젝트 구조

```
📁 /
├── 📁 src/                    # 소스 코드 루트 (현재 환경에서는 / = src/)
│   ├── App.tsx                # 메인 애플리케이션 엔트리
│   │
│   ├── 📁 features/           # 도메인 기반 기능 모듈
│   │   ├── 📁 auth/          # 인증 관련 (로그인, 회원가입)
│   │   │   ├── components/   # 인증 전용 컴포넌트
│   │   │   ├── hooks/        # 인증 전용 훅
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   │
│   │   ├── 📁 dashboard/     # 대시보드 (역할별)
│   │   │   ├── components/
│   │   │   │   ├── DashboardStats.tsx
│   │   │   │   ├── DocumentTable.tsx
│   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── hooks/
│   │   │   └── DashboardPage.tsx
│   │   │
│   │   └── 📁 documents/     # 문서관리
│   │       ├── components/
│   │       ├── hooks/
│   │       └── DocumentsPage.tsx
│   │
│   ├── 📁 shared/             # 프로젝트 공용 자원
│   │   ├── 📁 components/    # 공통 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── Logo.tsx
│   │   │
│   │   ├── 📁 hooks/         # 전역 커스텀 훅
│   │   │   ├── useBoolean.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── useLocalStorage.ts
│   │   │
│   │   ├── 📁 utils/         # 유틸리티 함수
│   │   │   ├── formatDate.ts
│   │   │   └── validation.ts
│   │   │
│   │   ├── 📁 constants/     # 전역 상수
│   │   │   ├── routes.ts
│   │   │   ├── colors.ts
│   │   │   └── userRoles.ts
│   │   │
│   │   ├── 📁 apis/          # API 클라이언트
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   └── dashboard.ts
│   │   │
│   │   └── 📁 types/         # 전역 타입 정의
│   │       ├── auth.ts
│   │       ├── dashboard.ts
│   │       └── common.ts
│   │
│   ├── 📁 imports/            # Figma 임포트 파일
│   │   ├── Home수신자원청.tsx
│   │   ├── Home기안자협력사.tsx
│   │   ├── Home결재자협력사.tsx
│   │   ├── Frame2085667571.tsx  # 로그인
│   │   ├── Frame2085667572.tsx  # 회원가입 1단계
│   │   ├── Frame2085667573.tsx  # 회원가입 2단계
│   │   └── svg-*.ts            # SVG 파일들
│   │
│   └── 📁 styles/             # 스타일 시스템
│       ├── globals.css        # 전역 스타일 (토큰 import)
│       ├── animations.css     # 애니메이션 정의
│       ├── reset.tsx          # CSS 리셋
│       └── 📁 token/          # 디자인 토큰
│           ├── token.css      # 컬러, Border Radius, Shadow
│           └── typography.css # 타이포그래피 시스템
```

## 🎨 디자인 시스템

### 1️⃣ Color Tokens (`/styles/token/token.css`)

#### Primary Brand (현대중공업)
- `--color-primary-main`: `#003087` (메인 브랜드 컬러)
- `--color-primary-dark`: `#002554` (진한 브랜드 컬러)
- `--color-primary-light`: `#DDE8F9` (Secondary 버튼 배경)
- `--color-primary-border`: `#B0CBEF` (Secondary 버튼 테두리)
- `--color-primary-text`: `#002970` (Secondary 버튼 텍스트)

#### Success (환경/친환경)
- `--color-success-main`: `#00AD1D` (Forward to Green)
- `--color-success-dark`: `#008233`
- `--color-success-icon`: `#009619`

#### Base & Surface
- `--color-page-bg`: `#F8F9FA` (페이지 배경)
- `--color-surface-default`: `#FFFFFF` (기본 Surface)
- `--color-surface-primary`: `#EFF4FC` (Primary Surface)

#### Text
- `--color-text-primary`: `#212529` (주 텍스트)
- `--color-text-secondary`: `#ADB5BD` (부 텍스트)
- `--color-text-tertiary`: `#868E96` (삼차 텍스트)

#### State Colors
- **Info**: `--color-state-info-*` (파란색 계열)
- **Success**: `--color-state-success-*` (초록색 계열)
- **Warning**: `--color-state-warning-*` (주황색 계열)
- **Error**: `--color-state-error-*` (빨간색 계열)

#### Business Logic
- **Risk Levels**: `--color-risk-high/medium/low-*`
- **Audit Status**: `--color-audit-pending/active/revision/done-*`

#### Border Radius
- `--radius-card`: `48px` (메인 카드)
- `--radius-default`: `20px` (버튼, 인풋)
- `--radius-small`: `12px` (작은 요소)
- `--radius-badge`: `24px` (뱃지)

#### Shadow
- `--shadow-card`: `4px 4px 20px 0 rgba(0, 0, 0, 0.1)`
- `--shadow-modal`: `0 -8px 20px 0 rgba(0, 0, 0, 0.05)`

### 2️⃣ Typography (`/styles/token/typography.css`)

#### Font Families
- `--font-family-bold`: `'HD:Bold', 'Pretendard', sans-serif`
- `--font-family-medium`: `'HD:Medium', 'Pretendard', sans-serif`

#### 카테고리별 폰트 크기 (1rem = 10px 기준)

**Display** (화면에서 가장 큰 텍스트, 마케팅 용도)
- Large: `6.4rem` (64px) - "FORWARD TO GREEN"
- Medium: `4.8rem` (48px) - "BEYOND BLUE"
- Small: `4.0rem` (40px)

**Heading** (페이지 단위 타이틀)
- Large: `3.2rem` (32px) - "SmartChain" 로고
- Medium: `2.8rem` (28px)
- Small: `2.4rem` (24px)

**Title** (템플릿/모듈 단위)
- XXLarge: `2.4rem` (24px)
- XLarge: `2.2rem` (22px)
- Large: `2.0rem` (20px)
- Medium: `1.8rem` (18px) - 섹션 타이틀
- Small: `1.6rem` (16px) - 카드 타이틀
- XSmall: `1.4rem` (14px)

**Body** (본문 텍스트)
- Large: `1.8rem` (18px)
- Medium: `1.6rem` (16px)
- Small: `1.4rem` (14px)

**Detail** (추가 정보)
- Large: `1.6rem` (16px)
- Medium: `1.4rem` (14px)
- Small: `1.2rem` (12px)

**Label** (버튼, 라벨, Chips)
- Large: `1.6rem` (16px)
- Medium: `1.4rem` (14px)
- Small: `1.2rem` (12px)
- XSmall: `1.1rem` (11px)

### 3️⃣ 사용 예시

#### 컬러 적용
```tsx
// CSS 변수 사용
<div className="bg-[var(--color-primary-main)] text-white">
  Primary Button
</div>

// 타이포그래피 클래스 사용
<h1 className="font-heading-large text-[var(--color-primary-main)]">
  SmartChain
</h1>

// Border Radius 사용
<div className="rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
  Card Content
</div>
```

#### 타이포그래피 클래스
```tsx
<p className="font-display-large">Display Large Text</p>
<p className="font-heading-medium">Heading Medium Text</p>
<p className="font-title-small">Title Small Text</p>
<p className="font-body-medium">Body Medium Text</p>
<p className="font-detail-small">Detail Small Text</p>
<p className="font-label-medium">Label Medium Text</p>
```

## 🚀 다음 단계

1. **컴포넌트 구현**
   - `/shared/components/` 에 공통 컴포넌트 생성
   - Button, Input, Badge 등 기본 UI 컴포넌트

2. **페이지 구현**
   - `/features/auth/` - 로그인, 회원가입 페이지
   - `/features/dashboard/` - 역할별 대시보드

3. **라우팅 설정**
   - React Router 추가
   - 라우트 구조 설정

4. **상태 관리**
   - Context API 또는 Zustand 추가
   - 인증 상태 관리

5. **API 연동**
   - axios 클라이언트 설정
   - API 엔드포인트 연결

## 📝 참고사항

- **Tailwind CSS v4** 사용 중
- **Root Font Size**: `62.5%` (1rem = 10px)
- **디자인 기준**: Figma 임포트 파일 기반
- **브랜드 컬러**: 현대중공업 Blue (`#003087`)
- **환경 컬러**: Forward to Green (`#00AD1D`)

## ✅ 구성 완료 항목

- [x] 프로젝트 구조 설계
- [x] Color Tokens 정의 (20+ 토큰)
- [x] Typography 시스템 (6개 카테고리)
- [x] Border Radius & Shadow 토큰
- [x] Global Styles 설정
- [x] 데모 페이지 구현

---

**Last Updated**: 2026-01-28
**Framework**: React + Vite + Tailwind CSS v4
**Project**: SmartChain - 현대중공업 협력사 통합관리시스템
