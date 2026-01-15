# SmartChain ESG - Frontend

<div align="center">

![SmartChain ESG Logo](https://via.placeholder.com/400x120/1a365d/ffffff?text=SmartChain+ESG)

**AI 기반 공급망 ESG 실사 자동화 플랫폼 - 프론트엔드**

Next.js 14 기반의 엔터프라이즈급 React 애플리케이션

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

[설치하기](#-설치하기) • [프로젝트 구조](#-프로젝트-구조) • [주요 기능](#-주요-기능) • [개발 가이드](#-개발-가이드)

</div>

---

## 📋 목차

- [개요](#-개요)
- [기술 스택](#-기술-스택)
- [설치하기](#-설치하기)
- [프로젝트 구조](#-프로젝트-구조)
- [주요 기능](#-주요-기능)
- [컴포넌트 가이드](#-컴포넌트-가이드)
- [상태 관리](#-상태-관리)
- [라우팅 구조](#-라우팅-구조)
- [개발 가이드](#-개발-가이드)
- [빌드 및 배포](#-빌드-및-배포)

---

## 🎯 개요

SmartChain ESG Frontend는 공급망 ESG 실사 프로세스를 직관적으로 관리할 수 있는 웹 인터페이스를 제공합니다. 5가지 역할(게스트/기안자/결재자/수신자/관리자)에 최적화된 UI/UX를 통해 복잡한 ESG 평가 워크플로우를 간소화합니다.

### 🎨 주요 특징

- **🔐 역할 기반 UI**: 사용자 권한에 따라 동적으로 변경되는 인터페이스
- **📊 실시간 대시보드**: React Query 기반 실시간 데이터 동기화
- **📤 드래그 앤 드롭 업로드**: 직관적인 증빙 파일 업로드 경험
- **♿ 접근성 준수**: WCAG 2.1 AA 레벨 준수
- **📱 반응형 디자인**: 데스크톱 중심, 태블릿 호환

---

## 🛠️ 기술 스택

### Core

| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 14.2 | React 프레임워크 (App Router) |
| **React** | 18.3 | UI 라이브러리 |
| **TypeScript** | 5.3 | 타입 안정성 |
| **Tailwind CSS** | 3.4 | 스타일링 |

### State Management & Data Fetching

| 기술 | 용도 |
|------|------|
| **React Query (TanStack Query)** | 서버 상태 관리 및 캐싱 |
| **Zustand** | 클라이언트 전역 상태 관리 |
| **React Hook Form** | 폼 상태 관리 및 유효성 검사 |
| **Zod** | 스키마 검증 |

### UI Components

| 라이브러리 | 용도 |
|-----------|------|
| **shadcn/ui** | 재사용 가능한 컴포넌트 |
| **Radix UI** | 접근성 기반 프리미티브 |
| **Lucide React** | 아이콘 |
| **Recharts** | 데이터 시각화 |
| **React Dropzone** | 파일 업로드 |

### Development Tools

- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **Husky** - Git Hooks
- **lint-staged** - Pre-commit 검사

---

## 🚀 설치하기

### 사전 요구사항

```bash
Node.js >= 18.17.0
npm >= 9.0.0 (또는 yarn >= 1.22.0)
```

### 설치 및 실행

```bash
# 1. 레포지토리 클론
git clone https://github.com/your-org/smartchain-frontend.git
cd smartchain-frontend

# 2. 의존성 설치
npm install
# 또는
yarn install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 환경 변수 설정

# 4. 개발 서버 실행
npm run dev
# 또는
yarn dev

# 5. 브라우저에서 http://localhost:3000 접속
```

### 환경 변수

`.env.local` 파일 설정:

```env
# API 엔드포인트
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000

# 애플리케이션 환경
NEXT_PUBLIC_APP_ENV=development

# 파일 업로드 설정
NEXT_PUBLIC_MAX_FILE_SIZE=52428800  # 50MB
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.pdf,.xlsx,.docx,.png,.jpg

# Azure Blob Storage (선택사항)
NEXT_PUBLIC_AZURE_STORAGE_URL=https://your-storage.blob.core.windows.net
```

---

## 📁 프로젝트 구조

```
smartchain-frontend/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # 인증 관련 페이지
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/              # 대시보드 레이아웃
│   │   ├── dashboard/            # 역할별 대시보드
│   │   │   ├── drafter/          # 기안자 대시보드
│   │   │   ├── approver/         # 결재자 대시보드
│   │   │   ├── reviewer/         # 수신자 대시보드
│   │   │   └── admin/            # 관리자 대시보드
│   │   ├── diagnostics/          # 진단 관리
│   │   │   ├── [id]/             # 진단 상세
│   │   │   └── create/           # 진단 생성
│   │   └── layout.tsx
│   ├── api/                      # API Routes (선택적)
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 홈페이지
│
├── components/                   # React 컴포넌트
│   ├── ui/                       # shadcn/ui 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── layout/                   # 레이아웃 컴포넌트
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   ├── diagnostic/               # 진단 관련 컴포넌트
│   │   ├── diagnostic-form.tsx
│   │   ├── diagnostic-list.tsx
│   │   ├── diagnostic-detail.tsx
│   │   └── status-badge.tsx
│   ├── upload/                   # 파일 업로드 컴포넌트
│   │   ├── file-dropzone.tsx
│   │   ├── file-list.tsx
│   │   └── upload-progress.tsx
│   ├── dashboard/                # 대시보드 위젯
│   │   ├── kpi-card.tsx
│   │   ├── chart-widget.tsx
│   │   └── recent-activity.tsx
│   └── common/                   # 공통 컴포넌트
│       ├── loading-spinner.tsx
│       ├── error-boundary.tsx
│       └── empty-state.tsx
│
├── lib/                          # 유틸리티 및 설정
│   ├── api/                      # API 클라이언트
│   │   ├── client.ts             # Axios 인스턴스
│   │   ├── endpoints.ts          # API 엔드포인트 정의
│   │   └── types.ts              # API 타입 정의
│   ├── hooks/                    # Custom Hooks
│   │   ├── use-auth.ts
│   │   ├── use-diagnostic.ts
│   │   ├── use-upload.ts
│   │   └── use-toast.ts
│   ├── store/                    # Zustand 스토어
│   │   ├── auth-store.ts
│   │   └── ui-store.ts
│   ├── utils/                    # 유틸리티 함수
│   │   ├── cn.ts                 # className 병합
│   │   ├── format.ts             # 날짜/숫자 포맷팅
│   │   └── validation.ts         # 유효성 검사
│   └── constants.ts              # 상수 정의
│
├── types/                        # TypeScript 타입 정의
│   ├── user.ts
│   ├── diagnostic.ts
│   ├── company.ts
│   └── index.ts
│
├── styles/                       # 스타일 파일
│   └── globals.css               # 전역 스타일
│
├── public/                       # 정적 파일
│   ├── images/
│   └── icons/
│
├── .env.example                  # 환경 변수 예시
├── .eslintrc.json               # ESLint 설정
├── .prettierrc                  # Prettier 설정
├── next.config.js               # Next.js 설정
├── tailwind.config.ts           # Tailwind 설정
├── tsconfig.json                # TypeScript 설정
└── package.json
```

---

## ✨ 주요 기능

### 1. 🔐 인증 및 권한 관리

```typescript
// lib/hooks/use-auth.ts
export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: fetchCurrentUser,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role,
  };
}
```

**기능:**
- JWT 기반 인증
- 역할 기반 접근 제어 (RBAC)
- 자동 토큰 갱신
- 권한별 라우트 보호

### 2. 📊 역할별 대시보드

```typescript
// app/(dashboard)/dashboard/[role]/page.tsx
export default function RoleDashboard({ params }: { params: { role: string } }) {
  const { data: metrics } = useQuery({
    queryKey: ['dashboard', params.role],
    queryFn: () => fetchDashboardMetrics(params.role),
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard title="제출 현황" value={metrics?.submitted} />
      <KPICard title="승인 대기" value={metrics?.pending} />
      <KPICard title="반려" value={metrics?.rejected} />
      <KPICard title="완료" value={metrics?.completed} />
    </div>
  );
}
```

**역할별 화면:**
- **기안자**: 작성 현황, 제출 이력, 반려 사유
- **결재자**: 검수 대기 목록, 승인/반려 처리
- **수신자**: 전체 협력사 현황, 위험군 분포
- **관리자**: 사용자 관리, 시스템 설정

### 3. 📤 파일 업로드 시스템

```typescript
// components/upload/file-dropzone.tsx
export function FileDropzone({ onUpload }: FileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: handleUpload,
  });

  return (
    <div {...getRootProps()} className={cn(
      "border-2 border-dashed rounded-lg p-8",
      isDragActive && "border-primary bg-primary/10"
    )}>
      <input {...getInputProps()} />
      <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground" />
      <p>파일을 드래그하거나 클릭하여 업로드</p>
    </div>
  );
}
```

**기능:**
- 드래그 앤 드롭 지원
- 실시간 업로드 진행률
- 다중 파일 업로드
- 파일 타입/크기 검증
- 업로드 실패 재시도

### 4. 📋 진단표 작성 (정성/정량 평가)

```typescript
// components/diagnostic/diagnostic-form.tsx
export function DiagnosticForm() {
  const form = useForm<DiagnosticFormValues>({
    resolver: zodResolver(diagnosticSchema),
  });

  const { mutate: saveDraft } = useMutation({
    mutationFn: saveDiagnosticDraft,
    onSuccess: () => toast.success('임시 저장되었습니다'),
  });

  return (
    <Form {...form}>
      <Tabs defaultValue="qualitative">
        <TabsList>
          <TabsTrigger value="qualitative">정성 평가</TabsTrigger>
          <TabsTrigger value="quantitative">정량 평가</TabsTrigger>
        </TabsList>
        
        <TabsContent value="qualitative">
          <QualitativeQuestions form={form} />
        </TabsContent>
        
        <TabsContent value="quantitative">
          <QuantitativeDataUpload form={form} />
        </TabsContent>
      </Tabs>
      
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => saveDraft(form.getValues())}>
          임시 저장
        </Button>
        <Button type="submit">제출</Button>
      </div>
    </Form>
  );
}
```

### 5. 📈 데이터 시각화

```typescript
// components/dashboard/chart-widget.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function ChartWidget({ data }: ChartWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ESG 점수 추이</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="environmental" stroke="#10b981" />
            <Line type="monotone" dataKey="social" stroke="#3b82f6" />
            <Line type="monotone" dataKey="governance" stroke="#8b5cf6" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

---

## 🧩 컴포넌트 가이드

### UI 컴포넌트 사용 예시

```typescript
// shadcn/ui 컴포넌트 사용
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>진단 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button>새 진단 생성</Button>
          </DialogTrigger>
          <DialogContent>
            {/* 진단 생성 폼 */}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
```

### 커스텀 Hook 예시

```typescript
// lib/hooks/use-diagnostic.ts
export function useDiagnostic(diagnosticId: string) {
  // 진단 데이터 조회
  const { data, isLoading } = useQuery({
    queryKey: ['diagnostic', diagnosticId],
    queryFn: () => fetchDiagnostic(diagnosticId),
  });

  // 진단 수정
  const { mutate: updateDiagnostic } = useMutation({
    mutationFn: updateDiagnosticMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic', diagnosticId] });
    },
  });

  // 진단 제출
  const { mutate: submitDiagnostic } = useMutation({
    mutationFn: submitDiagnosticMutation,
  });

  return {
    diagnostic: data,
    isLoading,
    updateDiagnostic,
    submitDiagnostic,
  };
}
```

---

## 🗂️ 상태 관리

### React Query (서버 상태)

```typescript
// lib/api/client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      retry: 1,
    },
  },
});
```

### Zustand (클라이언트 상태)

```typescript
// lib/store/ui-store.ts
import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));
```

---

## 🛣️ 라우팅 구조

```
/                           → 홈페이지 (랜딩)
/login                      → 로그인
/register                   → 회원가입

/dashboard/drafter          → 기안자 대시보드
/dashboard/approver         → 결재자 대시보드
/dashboard/reviewer         → 수신자 대시보드
/dashboard/admin            → 관리자 대시보드

/diagnostics                → 진단 목록
/diagnostics/create         → 진단 생성
/diagnostics/[id]           → 진단 상세
/diagnostics/[id]/edit      → 진단 수정

/companies                  → 협력사 관리 (관리자)
/users                      → 사용자 관리 (관리자)
/settings                   → 설정
```

---

## 💻 개발 가이드

### 코드 스타일

```bash
# ESLint 검사
npm run lint

# Prettier 포맷팅
npm run format

# 타입 체크
npm run type-check
```

### 컴포넌트 생성 규칙

```typescript
// 1. 함수형 컴포넌트 사용
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // ...
}

// 2. Props 타입 정의
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

// 3. className 병합 시 cn 유틸 사용
import { cn } from '@/lib/utils/cn';

<div className={cn("base-class", conditionalClass && "conditional-class")} />
```

### API 호출 패턴

```typescript
// lib/api/diagnostics.ts
import { apiClient } from './client';
import type { Diagnostic } from '@/types/diagnostic';

export async function fetchDiagnostics(): Promise<Diagnostic[]> {
  const { data } = await apiClient.get('/diagnostics');
  return data;
}

export async function createDiagnostic(payload: CreateDiagnosticPayload): Promise<Diagnostic> {
  const { data } = await apiClient.post('/diagnostics', payload);
  return data;
}
```

### 테스트 (선택사항)

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e
```

---

## 🚢 빌드 및 배포

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 빌드 결과 미리보기
npm run start
```

### Docker 배포

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# 빌드 및 실행
docker build -t smartchain-frontend .
docker run -p 3000:3000 smartchain-frontend
```

### Azure App Service 배포

```bash
# Azure CLI로 배포
az webapp up --name smartchain-frontend --resource-group smartchain-rg
```

---

## 📚 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com/)
- [TanStack Query 문서](https://tanstack.com/query/latest)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

---

## 🤝 기여하기

버그 리포트나 기능 제안은 [Issues](https://github.com/your-org/smartchain-frontend/issues)에 등록해주세요.

---

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

<div align="center">

**Made with ❤️ by KT AIVLE School 8th - Team 10**

[메인 프로젝트](https://github.com/your-org) • [백엔드](https://github.com/your-org/smartchain-backend) • [AI 서비스](https://github.com/your-org/smartchain-ai)

</div>
