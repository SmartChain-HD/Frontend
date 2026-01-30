# 🏗️ SmartChain - 현대중공업 협력사 통합관리시스템

> React + Vite + Tailwind CSS v4 + TypeScript

## ✨ 완성된 기능

### 🔐 인증 (Authentication)
- **로그인 페이지** (`/login`)
  - 이메일/비밀번호 로그인
  - "BEYOND BLUE, FORWARD TO GREEN" 브랜드 비주얼
  - 회원가입 링크
  
- **회원가입 - 2단계 프로세스**
  - 1단계 (`/signup/step1`): 개인정보 활용동의
    - 약관 전체 동의
    - 개인정보 수집 및 이용 동의 (라디오 버튼)
  - 2단계 (`/signup/step2`): 개인정보 입력
    - 이름, 이메일(인증 요청), 비밀번호, 비밀번호 확인

### 🏠 대시보드 (Dashboard)
역할별로 다른 대시보드가 제공됩니다:

#### 1️⃣ 수신자/원청 대시보드 (`userRole: 'receiver'`)
- 통계 카드: 전체 협력사, 미제출, 검토중, 보완요청, 완료
- 협력사 리스크 관리 테이블
- 실시간 알림 피드

#### 2️⃣ 기안자/협력사 대시보드 (`userRole: 'drafter'`)
- 통계 카드: 미제출, 검토중, 보완요청, 완료
- 제출 필요 기안 테이블
- 실시간 알림 피드

#### 3️⃣ 결재자/협력사 대시보드 (`userRole: 'approver'`)
- 통계 카드: 제출 대기, 검토중, 보완요청, 완료
- 검토 필요 리스트 테이블
- 실시간 알림 피드

## 🗂️ 프로젝트 구조

```
📁 /
├── 📁 features/
│   ├── 📁 auth/                    # 인증 기능
│   │   ├── LoginPage.tsx          # 로그인
│   │   ├── SignupStep1Page.tsx    # 회원가입 1단계
│   │   └── SignupStep2Page.tsx    # 회원가입 2단계
│   │
│   └── 📁 dashboard/               # 대시보드
│       ├── ReceiverDashboard.tsx  # 수신자 대시보드
│       ├── DrafterDashboard.tsx   # 기안자 대시보드
│       ├── ApproverDashboard.tsx  # 결재자 대시보드
│       └── 📁 components/
│           ├── DashboardHeader.tsx
│           ├── DashboardSidebar.tsx
│           ├── StatsGrid.tsx
│           ├── DataTable.tsx
│           └── ActivityFeed.tsx
│
├── 📁 shared/
│   └── 📁 components/              # 공통 컴포넌트
│       ├── Button.tsx             # Primary/Secondary 버튼
│       ├── Input.tsx              # TextField 컴포넌트
│       ├── Logo.tsx               # SmartChain 로고
│       └── FormControls.tsx       # Checkbox, RadioButton
│
├── 📁 styles/
│   ├── globals.css                # 전역 스타일
│   └── 📁 token/
│       ├── token.css              # 컬러, Border Radius, Shadow
│       └── typography.css         # 타이포그래피 시스템
│
├── 📁 imports/                     # Figma 임포트 파일
│
├── App.tsx                        # 라우팅 및 상태관리
├── main.tsx                       # 엔트리 포인트
└── index.html
```

## 🚀 시작하기

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

## 📍 라우팅

| 경로 | 설명 | 접근 권한 |
|------|------|----------|
| `/` | 루트 → `/login`으로 리다이렉트 | Public |
| `/login` | 로그인 페이지 | Public |
| `/signup/step1` | 회원가입 1단계 (개인정보 활용동의) | Public |
| `/signup/step2` | 회원가입 2단계 (개인정보 입력) | Public |
| `/dashboard` | 역할별 대시보드 | Protected |

## 🎭 사용자 역할 (User Roles)

애플리케이션은 `localStorage`의 `userRole` 값에 따라 다른 대시보드를 표시합니다:

```typescript
type UserRole = 'receiver' | 'drafter' | 'approver';
```

- **receiver**: 수신자/원청 → ReceiverDashboard
- **drafter**: 기안자/협력사 → DrafterDashboard  
- **approver**: 결재자/협력사 → ApproverDashboard

### 테스트 방법
로그인 후 개발자 도구 콘솔에서:
```javascript
// 수신자로 변경
localStorage.setItem('userRole', 'receiver');
location.reload();

// 기안자로 변경
localStorage.setItem('userRole', 'drafter');
location.reload();

// 결재자로 변경
localStorage.setItem('userRole', 'approver');
location.reload();
```

## 🎨 디자인 시스템

### 컬러 토큰
```css
--color-primary-main: #003087     /* 메인 브랜드 */
--color-primary-dark: #002554     /* 진한 브랜드 */
--color-success-main: #00AD1D     /* Forward to Green */
--color-page-bg: #F8F9FA          /* 페이지 배경 */
--color-surface-primary: #EFF4FC  /* Surface */
```

### 타이포그래피
```css
/* Display */
.font-display-large    /* 64px - "FORWARD TO GREEN" */
.font-display-medium   /* 48px - "BEYOND BLUE" */

/* Heading */
.font-heading-large    /* 32px - 페이지 타이틀 */
.font-heading-medium   /* 28px */
.font-heading-small    /* 24px */

/* Title */
.font-title-xxlarge    /* 24px */
.font-title-large      /* 20px */
.font-title-medium     /* 18px */
.font-title-small      /* 16px */

/* Body */
.font-body-large       /* 18px */
.font-body-medium      /* 16px */
.font-body-small       /* 14px */
```

### Border Radius
```css
--radius-card: 48px      /* 메인 카드 */
--radius-default: 20px   /* 버튼, 인풋 */
--radius-small: 12px     /* 작은 요소 */
--radius-badge: 24px     /* 뱃지 */
```

## 🧩 주요 컴포넌트

### Button
```tsx
<Button variant="primary" size="large">로그인</Button>
<Button variant="secondary" size="default">회원가입</Button>
```

### Input
```tsx
<Input
  label="이메일"
  type="email"
  placeholder="이메일을 입력해주세요."
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Logo
```tsx
<Logo size="small" />
<LogoWithSubtitle />
```

### Badge
```tsx
<Badge variant="approved">정정</Badge>
<Badge variant="correction">보정</Badge>
<Badge variant="draft">미제출</Badge>
<Badge variant="pending">보관</Badge>
```

## 📱 반응형

- 기본 해상도: 1920x1080 (Desktop)
- 모바일 반응형은 추후 구현 예정

## 🔐 인증 흐름

1. 사용자가 `/login`에서 로그인
2. 인증 성공 시 `localStorage.setItem('userRole', role)` 저장
3. `/dashboard`로 리다이렉트
4. `DashboardRouter`가 `userRole`에 따라 적절한 대시보드 렌더링
5. 로그아웃 시 `localStorage.clear()` 및 `/login`으로 이동

## 🛠️ 기술 스택

- **React 18.3** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **React Router v6** - 클라이언트 사이드 라우팅
- **Tailwind CSS v4** - 스타일링
- **Lucide React** - 아이콘

## 📝 참고사항

- 현재 인증은 Mock 구현 (실제 API 연동 필요)
- 이메일 인증은 시뮬레이션 (실제 이메일 발송 미구현)
- 데이터는 하드코딩된 Mock 데이터 사용
- 실시간 알림 피드는 정적 데이터

## 🎯 다음 단계

- [ ] 실제 백엔드 API 연동
- [ ] 이메일 인증 기능 구현
- [ ] 상세 페이지 구현 (문서 보기, 수정 등)
- [ ] 실시간 알림 기능 (WebSocket)
- [ ] 모바일 반응형 대응
- [ ] 다크모드 지원
- [ ] 테스트 코드 작성

---

**Last Updated**: 2026-01-28  
**Version**: 1.0.0  
**Project**: SmartChain - 현대중공업 협력사 통합관리시스템
